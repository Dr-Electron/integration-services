import { NextFunction, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ChannelService } from '../../services/channel-service';
import { AuthenticatedRequest } from '../../models/types/verification';
import { get as lodashGet } from 'lodash';
import { AddChannelLogBody, CreateChannelBody } from '../../models/types/request-bodies';

export class ChannelRoutes {
	constructor(private readonly channelService: ChannelService) {}

	createChannel = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response<any>> => {
		try {
			const { topics, seed, encrypted } = req.body as CreateChannelBody;
			const { identityId } = req.user;

			if (!identityId) {
				return res.sendStatus(StatusCodes.BAD_REQUEST);
			}

			const channel = await this.channelService.create(identityId, topics, encrypted, seed);
			return res.status(StatusCodes.CREATED).send(channel);
		} catch (error) {
			next(error);
		}
	};

	getLogs = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response<any>> => {
		try {
			const channelAddress = lodashGet(req, 'params.channelAddress');
			const { identityId } = req.user;

			if (!channelAddress || !identityId) {
				return res.sendStatus(StatusCodes.BAD_REQUEST);
			}

			const limitParam = parseInt(<string>req.query.limit, 10);
			const indexParam = parseInt(<string>req.query.index, 10);
			const limit = isNaN(limitParam) || limitParam == 0 ? undefined : limitParam;
			const index = isNaN(indexParam) ? undefined : indexParam;
			const options = limit !== undefined && index !== undefined && { limit, index };

			const channel = await this.channelService.getLogs(channelAddress, identityId, options);
			return res.status(StatusCodes.OK).send(channel);
		} catch (error) {
			next(error);
		}
	};

	addLogs = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response<any>> => {
		try {
			const channelAddress = lodashGet(req, 'params.channelAddress');
			const { identityId } = req.user;
			const body = req.body as AddChannelLogBody;

			if (!channelAddress || !identityId) {
				return res.sendStatus(StatusCodes.BAD_REQUEST);
			}

			const channel = await this.channelService.addLogs(channelAddress, identityId, body);
			return res.status(StatusCodes.OK).send(channel);
		} catch (error) {
			next(error);
		}
	};
}
