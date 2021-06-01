import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { CreateIdentityBody, VerifiableCredentialJson } from '../../models/types/identity';
import { AuthenticationService } from '../../services/authentication-service';
import { Config } from '../../models/config';
import { AuthenticatedRequest, AuthorizationCheck, RevokeVerificationBody, VerifyIdentityBody } from '../../models/types/authentication';
import { SelfSovereignIdentityService } from '../../services/ssi-service';
import { User, UserRoles } from '../../models/types/user';
import * as KeyCollectionLinksDb from '../../database/verifiable-credentials';
import { AuthorizationService } from '../../services/authorization-service';
import { VerifiableCredentialPersistence } from '../../models/types/key-collection';

export class AuthenticationRoutes {
	private readonly authenticationService: AuthenticationService;
	readonly authorizationService: AuthorizationService;
	readonly ssiService: SelfSovereignIdentityService;
	private readonly config: Config;

	constructor(
		authenticationService: AuthenticationService,
		ssiService: SelfSovereignIdentityService,
		authorizationService: AuthorizationService,
		config: Config
	) {
		this.authenticationService = authenticationService;
		this.authorizationService = authorizationService;
		this.ssiService = ssiService;
		this.config = config;
	}

	createIdentity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const createIdentityBody: CreateIdentityBody = req.body;
			const identity = await this.authenticationService.createIdentity(createIdentityBody);

			res.status(StatusCodes.CREATED).send(identity);
		} catch (error) {
			next(error);
		}
	};

	verifyIdentity = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
		try {
			const verifyIdentityBody: VerifyIdentityBody = req.body;
			const { initiatorVC, subjectId, checkExistingVC } = verifyIdentityBody;
			const requestUser = req.user;
			const subject = await this.ssiService.getUser(subjectId);
			if (!subject) {
				throw new Error('subject does not exist!');
			}

			// check existing vcs and update verification state based on it
			if (!initiatorVC && checkExistingVC) {
				return await this.verifyByExistingVCs(res, subject, requestUser.userId);
			}

			const { isAuthorized, error } = await this.isAuthorizedToVerify(subject, initiatorVC, requestUser);
			if (!isAuthorized) {
				throw error;
			}

			const vc: VerifiableCredentialJson = await this.authenticationService.verifyIdentity(
				subject,
				this.config.serverIdentityId,
				initiatorVC?.credentialSubject?.id || requestUser.userId
			);

			res.status(StatusCodes.OK).send(vc);
		} catch (error) {
			next(error);
		}
	};

	verifyByExistingVCs = async (res: Response, user: User, requestId: string) => {
		const hasVerifiedVCs = await this.authenticationService.hasVerifiedVerifiableCredential(user.verifiableCredentials);
		const date = new Date();
		const vup = {
			userId: user.userId,
			verified: hasVerifiedVCs,
			lastTimeChecked: date,
			verificationDate: date,
			verificationIssuerId: requestId
		};
		await this.ssiService.updateUserVerification(vup);
		res.status(StatusCodes.OK).send(vup);
	};

	checkVerifiableCredential = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const vcBody: VerifiableCredentialJson = req.body;
			const isVerified = await this.authenticationService.checkVerifiableCredential(vcBody);
			res.status(StatusCodes.OK).send({ isVerified });
		} catch (error) {
			next(error);
		}
	};

	revokeVerifiableCredential = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
		try {
			const revokeBody: RevokeVerificationBody = req.body;
			const requestUser = req.user;

			const vcp = await KeyCollectionLinksDb.getVerifiableCredential(revokeBody.subjectId, revokeBody.signatureValue, this.config.serverIdentityId);
			if (!vcp) {
				throw new Error('no vc found to revoke the verification!');
			}
			const { isAuthorized, error } = await this.isAuthorizedToRevoke(vcp, requestUser);
			if (!isAuthorized) {
				throw error;
			}

			await this.authenticationService.revokeVerifiableCredential(vcp, this.config.serverIdentityId);

			res.sendStatus(StatusCodes.OK);
		} catch (error) {
			next(error);
		}
	};

	getLatestDocument = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const decodeParam = (param: string): string | undefined => (param ? decodeURI(param) : undefined);
			const did = req.params && decodeParam(<string>req.params['userId']);

			if (!did) {
				res.sendStatus(StatusCodes.BAD_REQUEST);
				return;
			}

			const doc = await this.authenticationService.getLatestDocument(did);

			res.status(StatusCodes.OK).send(doc);
		} catch (error) {
			next(error);
		}
	};

	getTrustedRootIdentities = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const trustedRoots = await this.authenticationService.getTrustedRootIds();
			res.status(StatusCodes.OK).send({ trustedRoots });
		} catch (error) {
			next(error);
		}
	};

	getNonce = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const decodeParam = (param: string): string | undefined => (param ? decodeURI(param) : undefined);
			const userId = req.params && decodeParam(<string>req.params['userId']);

			if (!userId) {
				res.status(StatusCodes.BAD_REQUEST).send({ error: 'A userId must be provided to the request path!' });
				return;
			}

			const nonce = await this.authenticationService.getNonce(userId);
			res.status(StatusCodes.OK).send({ nonce });
		} catch (error) {
			next(error);
		}
	};

	proveOwnership = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const decodeParam = (param: string): string | undefined => (param ? decodeURI(param) : undefined);
			const userId = req.params && decodeParam(<string>req.params['userId']);
			const body = req.body;
			const signedNonce = body?.signedNonce;

			if (!signedNonce || !userId) {
				res.sendStatus(StatusCodes.BAD_REQUEST);
				return;
			}

			const jwt = await this.authenticationService.authenticate(signedNonce, userId);
			res.status(StatusCodes.OK).send({ jwt });
		} catch (error) {
			next(error);
		}
	};

	isAuthorizedToRevoke = async (kci: VerifiableCredentialPersistence, requestUser: User): Promise<AuthorizationCheck> => {
		const isAuthorizedUser = this.authorizationService.isAuthorizedUser(requestUser.userId, kci.vc.id);
		const isAuthorizedInitiator = this.authorizationService.isAuthorizedUser(requestUser.userId, kci.initiatorId);
		if (!isAuthorizedUser && !isAuthorizedInitiator) {
			const isAuthorizedAdmin = await this.authorizationService.isAuthorizedAdmin(requestUser, kci.vc.id);
			if (!isAuthorizedAdmin) {
				return { isAuthorized: false, error: new Error('not allowed to revoke credential!') };
			}
		}

		return { isAuthorized: true, error: null };
	};

	isAuthorizedToVerify = async (subject: User, initiatorVC: VerifiableCredentialJson, requestUser: User): Promise<AuthorizationCheck> => {
		const isAdmin = requestUser.role === UserRoles.Admin;
		if (!isAdmin || !this.authorizationService.hasAuthorizationType(requestUser.type)) {
			if (!initiatorVC || !initiatorVC.credentialSubject) {
				return { isAuthorized: false, error: new Error('no valid verfiable credential!') };
			}

			if (requestUser.userId !== initiatorVC.credentialSubject.id || requestUser.userId !== initiatorVC.id) {
				return { isAuthorized: false, error: new Error('user id of request does not concur with the initiatorVC user id!') };
			}

			if (
				!this.authorizationService.hasAuthorizationType(initiatorVC.credentialSubject.type) &&
				!this.authorizationService.hasAuthorizationType(requestUser.type)
			) {
				return { isAuthorized: false, error: new Error('initiator is not allowed based on its type!') };
			}

			if (
				(initiatorVC.credentialSubject.organization || subject.organization) &&
				subject.organization !== initiatorVC.credentialSubject.organization
			) {
				return { isAuthorized: false, error: new Error('user must be in same organization!') };
			}

			const isInitiatorVerified = await this.authenticationService.checkVerifiableCredential(initiatorVC);
			if (!isInitiatorVerified) {
				return { isAuthorized: false, error: new Error('initiator has to be verified!') };
			}
		}
		return { isAuthorized: true, error: null };
	};
}
