import {
	User,
	UserPersistence,
	UserRoles,
	UserSearch,
	Verification,
	VerificationPersistence,
	VerificationUpdatePersistence
} from '../models/types/user';
import * as userDb from '../database/user';
import { DeleteWriteOpResultObject, InsertOneWriteOpResult, UpdateWriteOpResult, WithId } from 'mongodb';
import { getDateFromString, getDateStringFromDate } from '../utils/date';
import isEmpty from 'lodash/isEmpty';
import { CreateIdentityBody, IdentityJsonUpdate, VerifiableCredentialJson } from '../models/types/identity';
import { SchemaValidator } from '../utils/validator';
import * as IdentityDocsDb from '../database/identity-docs';
import { SsiService } from './ssi-service';

export class UserService {
	private readonly ssiService: SsiService;
	private readonly serverSecret: string;

	constructor(ssiService: SsiService, serverSecret: string) {
		this.ssiService = ssiService;
		this.serverSecret = serverSecret;
	}

	searchUsers = async (userSearch: UserSearch): Promise<User[]> => {
		const usersPersistence = await userDb.searchUsers(userSearch);
		return usersPersistence.map((user) => this.getUserObject(user));
	};

	createIdentity = async (createIdentityBody: CreateIdentityBody): Promise<IdentityJsonUpdate> => {
		const identity = await this.ssiService.createIdentity();
		const user: User = {
			...createIdentityBody,
			identityId: identity.doc.id.toString(),
			publicKey: identity.key.public
		};

		await this.addUser(user);

		if (createIdentityBody.storeIdentity && this.serverSecret) {
			await IdentityDocsDb.saveIdentity(identity, this.serverSecret);
		}

		return {
			...identity
		};
	};

	getUser = async (identityId: string): Promise<User | null> => {
		const userPersistence = await userDb.getUser(identityId);
		return userPersistence && this.getUserObject(userPersistence);
	};

	getUsersByIds = async (identityIds: string[]): Promise<User[] | null> => {
		const usersPersistence = await userDb.getUsersByIds(identityIds);
		if (!usersPersistence) {
			return null;
		}
		return usersPersistence.map((userP: UserPersistence) => this.getUserObject(userP));
	};

	getUserByUsername = async (username: string): Promise<User> => {
		const userPersistence = await userDb.getUserByUsername(username);
		return this.getUserObject(userPersistence);
	};

	addUser = async (user: User): Promise<InsertOneWriteOpResult<WithId<unknown>>> => {
		if (!this.hasValidFields(user)) {
			throw new Error('no valid body provided!');
		}
		const validator = SchemaValidator.getInstance();
		validator.validateUser(user);

		const userPersistence = this.getUserPersistence(user);
		const res = await userDb.addUser(userPersistence);
		if (!res?.result?.n) {
			throw new Error('could not create user identity!');
		}
		return res;
	};

	updateUser = async (user: User): Promise<UpdateWriteOpResult> => {
		const userPersistence = this.getUserPersistence(user);
		return userDb.updateUser(userPersistence);
	};

	updateUserVerification = async (vup: VerificationUpdatePersistence): Promise<void> => {
		await userDb.updateUserVerification(vup);
	};

	addUserVC = async (vc: VerifiableCredentialJson): Promise<void> => {
		await userDb.addUserVC(vc);
	};

	removeUserVC = async (vc: VerifiableCredentialJson): Promise<UserPersistence> => {
		return userDb.removeUserVC(vc);
	};

	deleteUser = async (identityId: string): Promise<DeleteWriteOpResultObject> => {
		return userDb.deleteUser(identityId);
	};

	private hasValidFields = (user: User): boolean => {
		return !(!user.publicKey && !user.identityId);
	};

	private getVerificationPersistence = (verification: Verification): VerificationPersistence | null => {
		return (
			verification && {
				verificationDate: verification.verificationDate && getDateFromString(verification.verificationDate),
				lastTimeChecked: verification.lastTimeChecked && getDateFromString(verification.lastTimeChecked),
				verified: verification.verified,
				verificationIssuerId: verification.verificationIssuerId
			}
		);
	};

	private getVerificationObject = (verificationPersistence: VerificationPersistence): Verification | null => {
		return (
			verificationPersistence && {
				verified: verificationPersistence.verified,
				verificationDate: getDateStringFromDate(verificationPersistence.verificationDate),
				lastTimeChecked: getDateStringFromDate(verificationPersistence.lastTimeChecked),
				verificationIssuerId: verificationPersistence.verificationIssuerId
			}
		);
	};

	private getUserPersistence = (user: User): UserPersistence | null => {
		if (user == null || isEmpty(user.identityId)) {
			throw new Error('Error when parsing the body: identityId must be provided!');
		}
		const { publicKey, identityId, username, verification, organization, registrationDate, type, claim, verifiableCredentials, role } = user;

		const userPersistence: UserPersistence = {
			identityId,
			publicKey,
			username,
			type,
			organization,
			registrationDate: registrationDate && getDateFromString(registrationDate),
			verification: this.getVerificationPersistence(verification),
			claim,
			verifiableCredentials,
			role: role && (role as UserRoles)
		};

		return userPersistence;
	};

	private getUserObject = (userPersistence: UserPersistence): User | null => {
		if (userPersistence == null || isEmpty(userPersistence.identityId)) {
			console.error('Error when parsing the body, no identity id found on persistence');
			return null;
		}

		const {
			username,
			publicKey,
			identityId,
			organization,
			registrationDate,
			verification,
			type,
			claim,
			verifiableCredentials,
			role
		} = userPersistence;

		const user: User = {
			identityId,
			publicKey,
			username,
			type,
			registrationDate: getDateStringFromDate(registrationDate),
			verification: this.getVerificationObject(verification),
			organization,
			claim,
			verifiableCredentials,
			role: role && (role as UserRoles)
		};
		return user;
	};
}
