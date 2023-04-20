import { DocumentClient } from 'aws-sdk/clients/dynamodb';

import { config } from '../config/config';
import { User, UserIdIndex } from '../models';

import { logger } from '/opt/nodejs/utils/powertools';

export default class UserService {
    private Tablename: string = config.TABLE_NAME!;

    constructor(private docClient: DocumentClient) {}

    async getUserByIndex(userId: string): Promise<UserIdIndex> {
        const userIdIndex = await this.docClient
            .query({
                TableName: this.Tablename,
                IndexName: 'userIdIndex',
                KeyConditionExpression: 'userId = :userId',
                ExpressionAttributeValues: {
                    ':userId': userId,
                },
            })
            .promise();
        if (!userIdIndex.Items) {
            throw new Error('User does not exist');
        }
        if (userIdIndex.Items.length === 0) {
            throw new Error('User does not exist');
        }
        logger.info('getUserByIndex', { data: userIdIndex });
        return userIdIndex.Items[0] as UserIdIndex;
    }

    async getAllUsers(): Promise<User[]> {
        const users = await this.docClient
            .scan({
                TableName: this.Tablename,
            })
            .promise();
        logger.info('getAllUsers', { users });
        return users.Items as User[];
    }

    async createUser(user: User): Promise<void> {
        await this.docClient
            .put({
                TableName: this.Tablename,
                Item: user,
            })
            .promise();
        logger.info('createUser', { user });
    }

    async getUser(userId: string): Promise<User> {
        // Get userIdIndex so we don't have to provide sort key (created) when getting user by userId.
        const userIdIndex = await this.getUserByIndex(userId);
        // Get user
        const user = await this.docClient
            .get({
                TableName: this.Tablename,
                Key: userIdIndex,
            })
            .promise();
        logger.info('getUser', { data: { userId, user } });
        if (!user.Item) {
            throw new Error('User does not exist');
        }
        return user.Item as User;
    }

    async updateUser(userId: string, user: Partial<User>): Promise<User> {
        const userIdIndex = await this.getUserByIndex(userId);
        const updatedUser = await this.docClient
            .update({
                TableName: this.Tablename,
                Key: userIdIndex,
                UpdateExpression: 'set verified = :verified',
                ExpressionAttributeValues: {
                    ':verified': user.verified,
                },
                ReturnValues: 'ALL_NEW',
            })
            .promise();
        logger.info('updateUser', { data: { userId, user, updatedUser } });
        return updatedUser.Attributes as User;
    }

    async deleteUser(userId: string): Promise<void> {
        const userIdIndex = await this.getUserByIndex(userId);
        await this.docClient
            .delete({
                TableName: this.Tablename,
                Key: userIdIndex,
            })
            .promise();
        logger.info('deleteUser', { data: { userId } });
    }
}
