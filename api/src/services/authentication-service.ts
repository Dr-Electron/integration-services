import { KEY_COLLECTION_INDEX, KEY_COLLECTION_SIZE } from '../config/identity';
import { KeyCollectionJson, KeyCollectionPersistence, VerifiableCredentialPersistence } from '../models/types/key-collection';
import {
	CreateIdentityBody,
	CredentialSubject,
	DocumentJsonUpdate,
	IdentityJson,
	IdentityJsonUpdate,
	VerifiableCredentialJson,
	Credential
} from '../models/types/identity';
import { User, VerificationUpdatePersistence } from '../models/types/user';
import { IdentityService } from './identity-service';
import { SelfSovereignIdentityService } from './ssi-service';
import { createNonce, getHexEncodedKey, verifySignedNonce } from '../utils/encryption';
import * as KeyCollectionDb from '../database/key-collection';
import * as VerifiableCredentialsDb from '../database/verifiable-credentials';
import * as AuthDb from '../database/auth';
import * as IdentitiesDb from '../database/identities';
import * as TrustedRootsDb from '../database/trusted-roots';
import jwt from 'jsonwebtoken';
import { AuthenticationServiceConfig } from '../models/config/services';
import { upperFirst } from 'lodash';
import { JsonldGenerator } from '../utils/jsonld';

export class AuthenticationService {
	private noIssuerFoundErrMessage = (issuerId: string) => `No identiity found for issuerId: ${issuerId}`;
	private readonly identityService: IdentityService;
	private readonly ssiService: SelfSovereignIdentityService;
	private readonly serverSecret: string;
	private readonly serverIdentityId: string;
	private readonly jwtExpiration: string;

	constructor(identityService: IdentityService, ssiService: SelfSovereignIdentityService, authenticationServiceConfig: AuthenticationServiceConfig) {
		const { serverSecret, jwtExpiration, serverIdentityId } = authenticationServiceConfig;
		this.identityService = identityService;
		this.ssiService = ssiService;
		this.serverSecret = serverSecret;
		this.serverIdentityId = serverIdentityId;
		this.jwtExpiration = jwtExpiration;
	}

	saveKeyCollection(keyCollection: KeyCollectionPersistence) {
		return KeyCollectionDb.saveKeyCollection(keyCollection, this.serverIdentityId, this.serverSecret);
	}

	getKeyCollection(index: number) {
		return KeyCollectionDb.getKeyCollection(index, this.serverIdentityId, this.serverSecret);
	}

	generateKeyCollection = async (issuerId: string): Promise<KeyCollectionPersistence> => {
		const index = KEY_COLLECTION_INDEX;
		const count = KEY_COLLECTION_SIZE;
		const issuerIdentity: IdentityJsonUpdate = await IdentitiesDb.getIdentity(issuerId, this.serverSecret);
		if (!issuerIdentity) {
			throw new Error(this.noIssuerFoundErrMessage(issuerId));
		}
		const { keyCollectionJson, docUpdate } = await this.identityService.generateKeyCollection(issuerIdentity, count);
		await this.updateDatabaseIdentityDoc(docUpdate);
		return {
			...keyCollectionJson,
			count,
			index
		};
	};

	async getIdentityFromDb(did: string): Promise<IdentityJsonUpdate> {
		return IdentitiesDb.getIdentity(did, this.serverSecret);
	}

	verifyIdentity = async (subject: User, issuerId: string, initiatorId: string) => {
		const jsonldGen = new JsonldGenerator();
		const data = jsonldGen.jsonldUserData(subject.type, subject.data);

		const credential: Credential<CredentialSubject> = {
			type: `${upperFirst(subject.type)}Credential`,
			id: subject.userId,
			subject: {
				...data,
				id: subject.userId,
				type: subject.type,
				organization: subject.organization,
				registrationDate: subject.registrationDate,
				initiatorId
			}
		};

		// TODO#54 dynamic key collection index by querying identities size and max size of key collection
		// if reached create new keycollection, always get highest index
		// TODO#80 use memoize for getKeyCollection
		const keyCollection = await this.getKeyCollection(KEY_COLLECTION_INDEX);
		const index = await VerifiableCredentialsDb.getNextCredentialIndex(KEY_COLLECTION_INDEX, this.serverIdentityId);
		const keyCollectionJson: KeyCollectionJson = {
			type: keyCollection.type,
			keys: keyCollection.keys
		};

		const issuerIdentity: IdentityJsonUpdate = await IdentitiesDb.getIdentity(issuerId, this.serverSecret);
		if (!issuerIdentity) {
			throw new Error(this.noIssuerFoundErrMessage(issuerId));
		}
		const vc = await this.identityService.createVerifiableCredential<CredentialSubject>(issuerIdentity, credential, keyCollectionJson, index);

		await VerifiableCredentialsDb.addVerifiableCredential(
			{
				vc,
				index,
				initiatorId,
				isRevoked: false,
				keyCollectionIndex: KEY_COLLECTION_INDEX
			},
			this.serverIdentityId
		);

		await this.setUserVerified(credential.id, issuerIdentity.doc.id, vc);
		return vc;
	};

	checkVerifiableCredential = async (vc: VerifiableCredentialJson): Promise<boolean> => {
		const serverIdentity: IdentityJson = await IdentitiesDb.getIdentity(this.serverIdentityId, this.serverSecret);
		if (!serverIdentity) {
			throw new Error('no valid server identity to check the credential.');
		}
		const isVerifiedCredential = await this.identityService.checkVerifiableCredential(vc);
		const trustedRoots = await this.getTrustedRootIds();

		const isTrustedIssuer = trustedRoots && trustedRoots.some((rootId) => rootId === vc.issuer);
		const isVerified = isVerifiedCredential && isTrustedIssuer;
		return isVerified;
	};

	revokeVerifiableCredential = async (vcp: VerifiableCredentialPersistence, issuerId: string) => {
		const subjectId = vcp.vc.id;

		const issuerIdentity: IdentityJsonUpdate = await IdentitiesDb.getIdentity(issuerId, this.serverSecret);
		if (!issuerIdentity) {
			throw new Error(this.noIssuerFoundErrMessage(issuerId));
		}

		const res = await this.identityService.revokeVerifiableCredential(issuerIdentity, vcp.index);
		await this.updateDatabaseIdentityDoc(res.docUpdate);

		if (res.revoked === true) {
			console.log('successfully revoked!');
		} else {
			console.log(`could not revoke identity for ${subjectId} on the ledger, maybe it is already revoked!`);
			return;
		}

		await VerifiableCredentialsDb.revokeVerifiableCredential(vcp, this.serverIdentityId);

		const updatedUser = await this.ssiService.removeUserVC(vcp.vc);
		const hasVerifiedVCs = await this.hasVerifiedVerifiableCredential(updatedUser.verifiableCredentials);

		if (updatedUser.verifiableCredentials.length === 0 || !hasVerifiedVCs) {
			const vup: VerificationUpdatePersistence = {
				userId: subjectId,
				verified: false,
				lastTimeChecked: new Date(),
				verificationDate: undefined,
				verificationIssuerId: undefined
			};
			await this.ssiService.updateUserVerification(vup);
		}

		return res;
	};

	hasVerifiedVerifiableCredential = async (vcs: VerifiableCredentialJson[]): Promise<boolean> => {
		if (!vcs || vcs.length === 0) {
			return false;
		}
		const vcVerifiedArr = await Promise.all(
			vcs.map(async (vc) => {
				return this.checkVerifiableCredential(vc);
			})
		);
		return vcVerifiedArr.some((v) => v);
	};

	private updateDatabaseIdentityDoc = async (docUpdate: DocumentJsonUpdate) => {
		await IdentitiesDb.updateIdentityDoc(docUpdate);
	};

	getLatestDocument = async (did: string) => {
		return await this.identityService.getLatestIdentityJson(did);
	};

	getTrustedRootIds = async () => {
		const trustedRoots = await TrustedRootsDb.getTrustedRootIds();

		if (!trustedRoots || trustedRoots.length === 0) {
			throw new Error('no trusted roots found!');
		}

		return trustedRoots.map((root) => root.userId);
	};

	getNonce = async (userId: string) => {
		const user = await this.ssiService.getUser(userId);
		if (!user) {
			throw new Error(`no user with id: ${userId} found!`);
		}

		const nonce = createNonce();
		await AuthDb.upsertNonce(user.userId, nonce);
		return nonce;
	};

	authenticate = async (signedNonce: string, userId: string) => {
		const user = await this.ssiService.getUser(userId);
		if (!user) {
			throw new Error(`no user with id: ${userId} found!`);
		}
		const { nonce } = await AuthDb.getNonce(userId);
		const publicKey = getHexEncodedKey(user.publicKey);

		const verified = await verifySignedNonce(publicKey, nonce, signedNonce);
		if (!verified) {
			throw new Error('signed nonce is not valid!');
		}

		if (!this.serverSecret) {
			throw new Error('no server secret set!');
		}

		const signedJwt = jwt.sign({ user }, this.serverSecret, { expiresIn: this.jwtExpiration });
		return signedJwt;
	};

	setUserVerified = async (userId: string, issuerId: string, vc: VerifiableCredentialJson) => {
		if (!issuerId) {
			throw new Error('No valid issuer id!');
		}
		const date = new Date();
		const vup: VerificationUpdatePersistence = {
			userId,
			verified: true,
			lastTimeChecked: date,
			verificationDate: date,
			verificationIssuerId: issuerId
		};
		await this.ssiService.updateUserVerification(vup);
		await this.ssiService.addUserVC(vc);
	};
}
