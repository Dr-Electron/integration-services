import {
	User,
	UserPersistence,
	UserRoles,
	UserSearch,
	UserSearchResponse,
	CreateIdentityBody,
	VerifiableCredentialJson,
	IdentityKeys,
	getDateFromString,
	getDateStringFromDate,
	Encoding
} from '@iota/is-shared-modules';
import * as userDb from '../database/user';
import isEmpty from 'lodash/isEmpty';
import { SchemaValidator } from '../utils/validator';
import * as IdentityDocsDb from '../database/identity-keys';
import { SsiService } from './ssi-service';
import { ILogger, Logger } from '../utils/logger';
import jwt from 'jsonwebtoken';
import { ConfigurationService } from './configuration-service';

export class UserService {
	constructor(private readonly ssiService: SsiService, private readonly serverSecret: string, private readonly logger: ILogger) {}

	async searchUsers(userSearch: UserSearch): Promise<UserSearchResponse[]> {
		const usersPersistence = await userDb.searchUsers(userSearch);
		return usersPersistence
			.map((user) => {
				const userObj = this.getUserObject(user);
				if (!userObj) {
					return null;
				}
				return {
					...userObj,
					verifiableCredentials: undefined,
					claim: {
						type: user.claim?.type
					},
					numberOfCredentials: user?.verifiableCredentials ? user.verifiableCredentials?.length : 0
				};
			})
			.filter((u) => u);
	}

	async createIdentity(createIdentityBody: CreateIdentityBody, authorization?: string) {
		const identity = await this.ssiService.createIdentity();
		console.log('identity.doc.id1111', identity);

		const creatorId = this.decodeUserId(authorization);

		console.log('identity.doc.id', identity.doc.id);
		console.log('identity.key.public().toString()', identity.key.public().toString());
		// TODO fix public key
		const user: User = {
			...createIdentityBody,
			id: identity.doc.id().toString(),
			publicKey: identity.key.public().toString(),
			creator: creatorId
		};

		await this.addUser(user);

		if (createIdentityBody.storeIdentity && this.serverSecret) {
			const identityKeys: IdentityKeys = {
				id: identity.doc.id().toString(),
				key: {
					public: identity.key.public().toString(),
					secret: identity.key.private().toString(),
					type: identity.key.type().toString(),
					encoding: Encoding.base58
				}
			};
			await IdentityDocsDb.saveIdentityKeys(identityKeys, this.serverSecret);
		}

		return {
			...identity
		};
	}

	decodeUserId(authorization: string): string | undefined {
		const { jwtSecret } = ConfigurationService.getInstance(Logger.getInstance()).config;
		if (!authorization || !authorization.startsWith('Bearer')) {
			return;
		}

		const split = authorization.split('Bearer ');
		if (split.length !== 2) {
			return;
		}

		const token = split[1];
		const decodedToken: any = jwt.verify(token, jwtSecret);

		if (typeof decodedToken === 'string' || !decodedToken?.user) {
			return;
		}
		const identityId: string = decodedToken?.user?.id;

		return identityId;
	}

	async getUser(id: string, isAuthorizedUser?: boolean): Promise<User | null> {
		const userPersistence = await userDb.getUser(id);
		const user = userPersistence && this.getUserObject(userPersistence);
		const privateUserInfo: boolean = user?.isPrivate && !isAuthorizedUser;

		if (!user) {
			return null;
		}

		return {
			...user,
			claim: !privateUserInfo ? user.claim : undefined,
			verifiableCredentials: !privateUserInfo ? user.verifiableCredentials : undefined
		};
	}

	async getIdentityId(username: string): Promise<string> {
		const userPersistence = await userDb.getUserByUsername(username);
		const user = this.getUserObject(userPersistence);
		return user?.id;
	}

	async addUser(user: User) {
		if (!this.hasValidFields(user)) {
			throw new Error('no valid body provided!');
		}
		const validator = SchemaValidator.getInstance(this.logger);
		validator.validateUser(user);

		const identityDoc = await this.ssiService.getLatestIdentityDoc(user.id);
		const publicKey = await this.ssiService.getPublicKey(identityDoc);
		console.log('publicKeypublicKey', publicKey);
		console.log('user.publicKey', user.publicKey);
		if (!publicKey || !user.publicKey || publicKey !== user.publicKey) {
			throw new Error('wrong identity provided');
		}

		const userPersistence = this.getUserPersistence(user);
		const res = await userDb.addUser(userPersistence);
		if (!res?.result?.n) {
			throw new Error('could not create user identity!');
		}
		return res;
	}

	async updateUser(user: User) {
		const userPersistence = this.getUserPersistence(user);
		return userDb.updateUser(userPersistence);
	}

	async addUserVC(vc: VerifiableCredentialJson): Promise<void> {
		await userDb.addUserVC(vc);
	}

	async removeUserVC(vc: VerifiableCredentialJson): Promise<UserPersistence> {
		return userDb.removeUserVC(vc);
	}

	async deleteUser(id: string) {
		return userDb.deleteUser(id);
	}

	private hasValidFields(user: User): boolean {
		return !(!user.publicKey && !user.id);
	}

	private getUserPersistence(user: User): UserPersistence | null {
		if (user == null || isEmpty(user.id)) {
			throw new Error('Error when parsing the body: id must be provided!');
		}
		const { publicKey, id, username, creator, registrationDate, claim, verifiableCredentials, role, isPrivate, isServerIdentity } = user;

		const userPersistence: UserPersistence = {
			id,
			publicKey,
			username,
			creator,
			registrationDate: registrationDate && getDateFromString(registrationDate),
			claim,
			verifiableCredentials,
			role: role && (role as UserRoles),
			isPrivate,
			isServerIdentity
		};

		return userPersistence;
	}

	private getUserObject(userPersistence: UserPersistence): User | null {
		if (userPersistence == null || isEmpty(userPersistence.id)) {
			return null;
		}

		const { username, creator, publicKey, id, registrationDate, claim, verifiableCredentials, role, isPrivate } = userPersistence;

		const user: User = {
			id,
			publicKey,
			username,
			creator,
			registrationDate: getDateStringFromDate(registrationDate),
			claim,
			verifiableCredentials,
			role: role && (role as UserRoles),
			isPrivate
		};
		return user;
	}
}
