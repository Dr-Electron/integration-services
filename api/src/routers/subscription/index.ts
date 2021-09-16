import { Router } from 'express';
import {
	AuthorizeSubscriptionBodySchema,
	RequestSubscriptionBodySchema,
	RevokeSubscriptionBodySchema
} from '../../models/schemas/request-response-body/subscription-bodies';
import { SubscriptionSchema } from '../../models/schemas/subscription';
import { SubscriptionRoutes } from '../../routes/subscription';
import { Logger } from '../../utils/logger';
import { apiKeyMiddleware, authMiddleWare, validate } from '../middlewares';
import { subscriptionService } from '../services';

const subscriptionRoutes = new SubscriptionRoutes(subscriptionService, Logger.getInstance());
const {
	getSubscriptions,
	getSubscriptionByIdentity,
	requestSubscription,
	authorizeSubscription,
	revokeSubscription,
	addSubscription
} = subscriptionRoutes;

export const subscriptionRouter = Router();

/**
 * @openapi
 * /subscriptions/{channelAddress}:
 *   get:
 *     summary: Get all subscriptions of a channel.
 *     description: Get all subscriptions of a channel. Use the is-authorized query parameter to filter for authorized subscriptions.
 *     tags:
 *     - subscriptions
 *     parameters:
 *     - name: channelAddress
 *       in: path
 *       required: true
 *       schema:
 *         $ref: "#/components/schemas/ChannelAddressSchema"
 *       examples:
 *         channelAddress:
 *           value: 5179bbd9714515aaebde8966c8cd17d3864795707364573b2f58d919364c63f70000000000000000:6d3cf83c5b57e5e5ab024f47
 *           summary: Example channel address
 *     - name: 'is-authorized'
 *       in: query
 *       required: false
 *       schema:
 *         type: boolean
 *       example: true
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Subscriptions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/SubscriptionSchema"
 *       401:
 *         description: No valid api key provided/ Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponseSchema'
 *       5XX:
 *         description: Unexpected error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponseSchema'
 */
subscriptionRouter.get('/:channelAddress', apiKeyMiddleware, authMiddleWare, getSubscriptions);

/**
 * @openapi
 * /subscriptions/{channelAddress}/{identityId}:
 *   get:
 *     summary: Get a subscription by identity id.
 *     description: Get a subscription of a channel by identity id.
 *     tags:
 *     - subscriptions
 *     parameters:
 *     - name: channelAddress
 *       in: path
 *       required: true
 *       schema:
 *         $ref: "#/components/schemas/ChannelAddressSchema"
 *       examples:
 *         channelAddress:
 *           value: 5179bbd9714515aaebde8966c8cd17d3864795707364573b2f58d919364c63f70000000000000000:6d3cf83c5b57e5e5ab024f47
 *           summary: Example channel address
 *     - name: identityId
 *       in: path
 *       required: true
 *       schema:
 *         $ref: '#/components/schemas/IdentityIdSchema'
 *       examples:
 *         identityId:
 *           value: did:iota:3yKgJoNyH9BEZ5Sh1YuHXAJeNARVqvEJLN87kd2ctm4h
 *           summary: Example identity id (DID identifier)
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Subscriptions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SubscriptionSchema"
 *       401:
 *         description: No valid api key provided/ Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponseSchema'
 *       5XX:
 *         description: Unexpected error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponseSchema'
 */
subscriptionRouter.get('/:channelAddress/:identityId', apiKeyMiddleware, authMiddleWare, getSubscriptionByIdentity);

/**
 * @openapi
 * /subscriptions/{channelAddress}/{identityId}:
 *   post:
 *     summary: Adds an existing subscription
 *     description: Adds an existing subscription (e.g. the subscription was not created with the api but locally.)
 *     tags:
 *     - subscriptions
 *     parameters:
 *     - name: channelAddress
 *       in: path
 *       required: true
 *       schema:
 *         $ref: "#/components/schemas/ChannelAddressSchema"
 *       examples:
 *         channelAddress:
 *           value: 5179bbd9714515aaebde8966c8cd17d3864795707364573b2f58d919364c63f70000000000000000:6d3cf83c5b57e5e5ab024f47
 *           summary: Example channel address
 *     - name: identityId
 *       in: path
 *       required: true
 *       schema:
 *         $ref: '#/components/schemas/IdentityIdSchema'
 *       examples:
 *         identityId:
 *           value: did:iota:3yKgJoNyH9BEZ5Sh1YuHXAJeNARVqvEJLN87kd2ctm4h
 *           summary: Example identity id (DID identifier)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/SubscriptionSchema"
 *           example:
 *             type: Subscriber
 *             seed: exampleSeed
 *             channelAddress: 5179bbd9714515aaebde8966c8cd17d3864795707364573b2f58d919364c63f70000000000000000:6d3cf83c5b57e5e5ab024f47
 *             identityId: did:iota:3yKgJoNyH9BEZ5Sh1YuHXAJeNARVqvEJLN87kd2ctm4h
 *             state: exampleState
 *             isAuthorized: false
 *             accessRights: ReadAndWrite
 *             publicKey: testKey
 *     responses:
 *       201:
 *         description: Subscription added
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SubscriptionSchema"
 *       400:
 *         description: Subscription already added or params missing
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponseSchema'
 *       401:
 *         description: No valid api key provided/ Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponseSchema'
 *       5XX:
 *         description: Unexpected error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponseSchema'
 */
subscriptionRouter.post('/:channelAddress/:identityId', apiKeyMiddleware, validate({ body: SubscriptionSchema }), authMiddleWare, addSubscription);

/**
 * @openapi
 * /subscriptions/request/{channelAddress}:
 *   post:
 *     summary: Request subscription to a channel
 *     description: Request subscription to a channel with address channel-address. A client can request a subscription to a channel which it then is able to read/write from. The subscriber can use an already generated seed or let it generate by the api so in this case the seed should be undefined.
 *     tags:
 *     - subscriptions
 *     parameters:
 *     - name: channelAddress
 *       in: path
 *       required: true
 *       schema:
 *         $ref: "#/components/schemas/ChannelAddressSchema"
 *       examples:
 *         channelAddress:
 *           value: 5179bbd9714515aaebde8966c8cd17d3864795707364573b2f58d919364c63f70000000000000000:6d3cf83c5b57e5e5ab024f47
 *           summary: Example channel address
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/RequestSubscriptionBodySchema"
 *           example:
 *             accessRights: Read
 *     responses:
 *       201:
 *         description: Link to requested subscription
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/RequestSubscriptionResponseSchema"
 *       400:
 *         description: Subscription already requested
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponseSchema'
 *       401:
 *         description: No valid api key provided/ Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponseSchema'
 *       5XX:
 *         description: Unexpected error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponseSchema'
 */
subscriptionRouter.post(
	'/request/:channelAddress',
	apiKeyMiddleware,
	authMiddleWare,
	validate({ body: RequestSubscriptionBodySchema }),
	requestSubscription
);

/**
 * @openapi
 * /subscriptions/authorize/{channelAddress}:
 *   post:
 *     summary: Authorize a subscription to a channel
 *     description: Authorize a subscription to a channel with address channel-address. The author of a channel can authorize a subscriber to read/write from a channel. Eventually after verifying its identity (using the Ecommerce-SSI Bridge).
 *     tags:
 *     - subscriptions
 *     parameters:
 *     - name: channelAddress
 *       in: path
 *       required: true
 *       schema:
 *         $ref: "#/components/schemas/ChannelAddressSchema"
 *       examples:
 *         channelAddress:
 *           value: 5179bbd9714515aaebde8966c8cd17d3864795707364573b2f58d919364c63f70000000000000000:6d3cf83c5b57e5e5ab024f47
 *           summary: Example channel address
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/AuthorizeSubscriptionBodySchema"
 *           example:
 *             subscriptionLink: 2742f37b457ca6f63b4de3a30b4a5073af5e964eeb76b46eddd1272dd4482a360000000000000000:2d054c5c0be6215bd8fffbfb
 *     responses:
 *       200:
 *         description: Link to requested subscription
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/AuthorizeSubscriptionResponseSchema"
 *
 *       401:
 *         description: No valid api key provided/ Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponseSchema'
 *       5XX:
 *         description: Unexpected error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponseSchema'
 */
subscriptionRouter.post(
	'/authorize/:channelAddress',
	apiKeyMiddleware,
	authMiddleWare,
	validate({ body: AuthorizeSubscriptionBodySchema }),
	authorizeSubscription
);

/**
 * @openapi
 * /subscriptions/revoke/{channelAddress}:
 *   post:
 *     summary: Revoke subscription to a channel.
 *     description: Revoke subscription to a channel. Only the author of a channel can revoke a subscription from a channel.
 *     tags:
 *     - subscriptions
 *     parameters:
 *     - name: channelAddress
 *       in: path
 *       required: true
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/RevokeSubscriptionBodySchema"
 *     responses:
 *       200:
 *         description: Sucessfully revoked the subscription.
 *       401:
 *         description: No valid api key provided/ Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponseSchema'
 *       5XX:
 *         description: Unexpected error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponseSchema'
 */
subscriptionRouter.post(
	'/revoke/:channelAddress',
	apiKeyMiddleware,
	authMiddleWare,
	validate({ body: RevokeSubscriptionBodySchema }),
	revokeSubscription
);
