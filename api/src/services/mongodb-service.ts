import {
	Db,
	MongoClient,
	MongoClientOptions,
	Collection,
	UpdateWriteOpResult,
	InsertOneWriteOpResult,
	WithId,
	DeleteWriteOpResultObject,
	FilterQuery,
	InsertWriteOpResult,
	UpdateOneOptions,
	CollectionInsertManyOptions,
	CollectionInsertOneOptions,
	FindOneOptions,
	CommonOptions
} from 'mongodb';
	import { ClientEncryption } from 'mongodb-client-encryption';
import { Logger } from '../utils/logger';

const logger = Logger.getInstance();
type WithoutProjection<T> = T & { fields?: undefined; projection?: undefined };
// type WithProjection<T extends { projection?: any }> = T & { projection: NonNullable<T['projection']> };

/**
 * MongoDbService to establish a connection and create, read, update and delete (CRUD) documents in the database.
 *
 * @export
 * @class MongoDbService
 */
export class MongoDbService {
	public static client: MongoClient;
	static clientEncryption: ClientEncryption;
	public static db: Db;

	private static getCollection(collectionName: string): Collection | null {
		if (!MongoDbService.db) {
			logger.error('Database not found!');
			return null;
		}
		return MongoDbService.db.collection(collectionName);
	}

	static async getDocument<T>(collectionName: string, query: FilterQuery<T>, options?: WithoutProjection<FindOneOptions<T>>): Promise<T> {
		const collection = MongoDbService.getCollection(collectionName);
		const item = await collection.findOne(query, options);
		await MongoDbService.decrypt(collectionName, item);
		return item;
	}

	static async getDocuments<T>(
		collectionName: string,
		query: FilterQuery<T>,
		options?: WithoutProjection<FindOneOptions<T>>
	): Promise<T[] | null> {
		const collection = MongoDbService.getCollection(collectionName);
		const result = await collection.find(query, options).toArray();
		for (const item in result) {
			await MongoDbService.decrypt(collectionName, item);
		}
		return result;
	}

	static async insertDocument<T>(
		collectionName: string,
		data: any,
		options?: CollectionInsertOneOptions
	): Promise<InsertOneWriteOpResult<WithId<T>> | null> {
		const collection = MongoDbService.getCollection(collectionName);
		await MongoDbService.encrypt(collectionName, data);
		console.log("Inserting", data);
		return collection.insertOne(data, options);
	}

	static async insertDocuments(
		collectionName: string,
		data: any,
		options?: CollectionInsertManyOptions
	): Promise<InsertWriteOpResult<any>> {
		const collection = MongoDbService.getCollection(collectionName);
		for (const item in data) {
			await MongoDbService.encrypt(collectionName, item);
		}
		return collection.insertMany(data, options);
	}

	static async updateDocument(
		collectionName: string,
		query: any,
		update: any,
		options?: UpdateOneOptions
	): Promise<UpdateWriteOpResult | null> {
		const collection = MongoDbService.getCollection(collectionName);
		return collection.updateOne(query, update, options);
	}

	static async removeDocument(collectionName: string, query: any, options?: CommonOptions): Promise<DeleteWriteOpResultObject> {
		const collection = MongoDbService.getCollection(collectionName);
		return collection.deleteOne(query, options);
	}

	static async removeDocuments(collectionName: string, query: any, options?: CommonOptions): Promise<DeleteWriteOpResultObject> {
		const collection = MongoDbService.getCollection(collectionName);
		return collection.deleteMany(query, options);
	}

	/**
	 * Get plain object for fields having a value not null and not undefined.
	 *
	 * @static
	 * @param {{ [key: string]: any }} fields Map of fields. For instance: { "height": 10, "length": 20, "unit": "metres", "depth": undefined }
	 * @return {*}  {{ [key: string]: any }} Map of fields with no fields having null or undefined. For instance: { "height": 10, "length": 20, "unit": "metres" }
	 * @memberof MongoDbService
	 */
	static getPlainObject(fields: { [key: string]: any }): { [key: string]: any } {
		const keys = Object.keys(fields);
		const values = Object.values(fields);
		const updateObject = values.reduce((acc, value, index) => {
			if (value == null) {
				return acc;
			}
			const key = keys[index];

			return {
				...acc,
				[key]: value
			};
		}, {});

		return updateObject;
	}

	/**
	 * Connect to the mongodb.
	 *
	 * @static
	 * @param {string} url The url to the mongodb.
	 * @param {string} dbName The name of the database.
	 * @return {*}  {Promise<MongoClient>}
	 * @memberof MongoDbService
	 */
	static async connect(url: string, dbName: string, clientEncryptionSecret: string): Promise<MongoClient> {
		if (MongoDbService.client) {
			return;
		}

		return new Promise((resolve, reject) => {
			const options: MongoClientOptions = {
				useUnifiedTopology: true
			};
			MongoClient.connect(url, options, function (err: Error, client: MongoClient) {
				if (err != null) {
					logger.error('could not connect to mongodb');
					reject(err);
					return;
				}
				logger.log('Successfully connected to mongodb');
				MongoDbService.client = client;
				MongoDbService.db = client.db(dbName);

				// TODO THIS CRASHES SINCE kmsProviders.local.key has wrong length
				// console.log('serverSecret', secret);

				MongoDbService.clientEncryption = new ClientEncryption(MongoDbService.client, {
					keyVaultNamespace: 'client.encryption',
					kmsProviders: {
						local: {
							key: Buffer.from(clientEncryptionSecret, 'hex') // The master key used for encryption/decryption. A 96-byte long Buffer
						}
					}
				});

				resolve(client);
			});
		});
	}

	/**
	 * Disconnect from the mongodb.
	 *
	 * @static
	 * @return {*}  {Promise<void>}
	 * @memberof MongoDbService
	 */
	public static disconnect(): Promise<void> {
		return MongoDbService.client.close();
	}

	public static async encrypt(collection: string, data: any) {
		if (data === null) {
			return
		}
		if (collection === "identity-docs") {
			const secret = data?.key?.secret;
			if (secret) {
				const keyId = await MongoDbService.clientEncryption.createDataKey('local');
				data.key.secret = await MongoDbService.clientEncryption.encrypt(secret, {
					keyId,
					algorithm: 'AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic'
				});
			}
		}
	}

	public static async decrypt(collection: string, data: any) {
		if (data === null) {
			return
		}
		if (collection === "identity-docs") {
			const secret = await MongoDbService.clientEncryption.decrypt(data?.key?.secret);
			data.key.secret = secret;
		}
	}

}
