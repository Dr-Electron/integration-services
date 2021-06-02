import { StreamsService } from './streams-service';
import { AccessRights, Subscription, SubscriptionType } from '../models/types/subscription';
import { Topic } from '../models/types/channel-info';
import { ChannelInfoService } from './channel-info-service';
import { SubscriptionService } from './subscription-service';
import { SubscriptionPool } from '../pools/subscription-pools';
import * as ChannelDataDb from '../database/channel-data';
import { ChannelData } from '../models/types/channel-data';

export class ChannelService {
	private readonly password: string;
	private readonly streamsService: StreamsService;
	private readonly channelInfoService: ChannelInfoService;
	private readonly subscriptionService: SubscriptionService;
	private readonly subscriptionPool: SubscriptionPool;

	constructor(
		streamsService: StreamsService,
		channelInfoService: ChannelInfoService,
		subscriptionService: SubscriptionService,
		config: { statePassword: string; streamsNode: string }
	) {
		this.streamsService = streamsService;
		this.channelInfoService = channelInfoService;
		this.subscriptionService = subscriptionService;
		this.subscriptionPool = SubscriptionPool.getInstance(config.streamsNode);
		this.password = config.statePassword;
	}

	create = async (identityId: string, topics: Topic[], seed?: string): Promise<{ seed: string; channelAddress: string }> => {
		const res = await this.streamsService.create(seed);
		if (!res?.seed || !res?.channelAddress || !res?.author) {
			throw new Error('could not create the channel');
		}

		const subscription: Subscription = {
			identityId,
			type: SubscriptionType.Author,
			channelAddress: res.channelAddress,
			seed: res.seed,
			subscriptionLink: res.channelAddress,
			state: this.streamsService.exportSubscription(res.author, this.password),
			accessRights: AccessRights.ReadAndWrite,
			isAuthorized: true
		};

		await this.subscriptionPool.add(res.channelAddress, res.author, identityId, true);
		await this.subscriptionService.addSubscription(subscription);
		await this.channelInfoService.addChannelInfo({
			topics,
			authorId: identityId,
			channelAddress: res.channelAddress,
			latestLink: res.channelAddress
		});

		return res;
	};

	fetchLogsFromTangle = async (channelAddress: string, identityId: string): Promise<ChannelData[]> => {
		const subscription = await this.subscriptionService.getSubscription(channelAddress, identityId);
		const isAuth = subscription.type === SubscriptionType.Author;
		const sub = await this.subscriptionPool.get(channelAddress, identityId, isAuth, this.password);
		if (!sub) {
			throw new Error(`no author/subscriber found with channelAddress: ${channelAddress} and identityId: ${identityId}`);
		}
		const logs = await this.streamsService.getLogs(sub);
		if (!logs) {
			return [];
		}
		await this.subscriptionService.updateSubscriptionState(
			channelAddress,
			identityId,
			this.streamsService.exportSubscription(logs.subscription, this.password)
		);

		// store logs in database
		if (logs.channelData?.length > 0) {
			await ChannelDataDb.addChannelData(channelAddress, identityId, logs.channelData);
		}
		return logs.channelData;
	};

	getLogs = async (channelAddress: string, identityId: string, options?: { limit: number; index: number }) => {
		await this.fetchLogsFromTangle(channelAddress, identityId);
		return await ChannelDataDb.getChannelData(channelAddress, identityId, options?.limit, options?.index);
	};

	addLogs = async (channelAddress: string, publicPayload: string, maskedPayload: string, identityId: string) => {
		const channelInfo = await this.channelInfoService.getChannelInfo(channelAddress);
		const isAuth = channelInfo.authorId === identityId;
		// TODO encrypt/decrypt seed
		const latestLink = channelInfo.latestLink;
		const sub = await this.subscriptionPool.get(channelAddress, identityId, isAuth, this.password);
		if (!sub) {
			throw new Error(`no author/subscriber found with channelAddress: ${channelAddress} and identityId: ${identityId}`);
		}
		const res = await this.streamsService.addLogs(latestLink, publicPayload, maskedPayload, sub);
		await this.subscriptionService.updateSubscriptionState(
			channelAddress,
			identityId,
			this.streamsService.exportSubscription(res.subscription, this.password)
		);
		await this.channelInfoService.updateLatestChannelLink(channelAddress, res.link);
		return res;
	};
}
