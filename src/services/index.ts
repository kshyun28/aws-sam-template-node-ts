import { DocumentClient } from 'aws-sdk/clients/dynamodb';

import UserService from './user';

export const userService = new UserService(new DocumentClient());
