import { APIGatewayEvent } from 'aws-lambda';
import * as uuid from 'uuid';

import { config } from 'src/config/config';
import { userService } from 'src/services';

import { lambdaHandler } from './create';

let apiGatewayEvent: APIGatewayEvent;

// Mock system time to properly test created timestamp.
const timestamp = Date.now();
jest.useFakeTimers().setSystemTime(timestamp);
// Mock lambda handler dependencies
jest.mock('uuid');

describe('Create User: POST /users', function () {
    beforeEach(() => {
        // Initialize process.env in jest.config.ts
        process.env = { ...config };

        // Initialize API Gateway Event
        apiGatewayEvent = {
            resource: '/users',
            path: '/users',
            httpMethod: 'POST',
            headers: {},
            multiValueHeaders: {},
            queryStringParameters: null,
            multiValueQueryStringParameters: null,
            pathParameters: null,
            stageVariables: null,
            isBase64Encoded: false,
            requestContext: {
                resourceId: '123456',
                authorizer: {},
                resourcePath: '/users',
                httpMethod: 'POST',
                path: '/users',
                accountId: '123456789012',
                protocol: 'HTTP/1.1',
                stage: 'develop',
                identity: {
                    accessKey: '',
                    accountId: '',
                    apiKey: '',
                    apiKeyId: '',
                    caller: '',
                    clientCert: {
                        clientCertPem: '',
                        issuerDN: '',
                        serialNumber: '',
                        subjectDN: '',
                        validity: { notAfter: '', notBefore: '' },
                    },
                    cognitoAuthenticationProvider: '',
                    cognitoAuthenticationType: '',
                    cognitoIdentityId: '',
                    cognitoIdentityPoolId: '',
                    principalOrgId: '',
                    sourceIp: '',
                    user: '',
                    userAgent: '',
                    userArn: '',
                },
                requestId: 'c6af9ac6-7b61-11e6-9a41-93e8deadbeef',
                requestTimeEpoch: 1428582896000,
                apiId: '1234',
            },
            body: '',
        };
    });

    afterEach(() => {
        // Restore all mocks created from 'jest.spyOn()'
        jest.restoreAllMocks();
    });

    it('should create a user', async () => {
        // Set variables
        const userId = '442bf4eb-4d25-49fe-812b-02687f7fa109';
        const firstName = 'Jasper';
        const lastName = 'Gabriel';
        apiGatewayEvent.body = JSON.stringify({
            firstName,
            lastName,
        });

        // Mock functions
        jest.spyOn(userService, 'createUser').mockReturnValue(Promise.resolve());
        jest.spyOn(uuid, 'v4').mockReturnValue(userId);

        const result = await lambdaHandler(apiGatewayEvent);
        expect(result.statusCode).toEqual(200);
        expect(result.headers).toEqual({
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Methods': 'POST',
            'Access-Control-Allow-Origin': '*',
        });
        expect(result.body).toEqual(
            JSON.stringify({
                message: 'Successfully created user',
                data: {
                    userId,
                    created: timestamp,
                    firstName,
                    lastName,
                    verified: false,
                },
            }),
        );
    });
    it('should throw an error when "firstName" is not a string', async () => {
        // Set variables
        const firstName = 420.69;
        const lastName = 'Gabriel';
        apiGatewayEvent.body = JSON.stringify({
            firstName,
            lastName,
        });

        const result = await lambdaHandler(apiGatewayEvent);
        expect(result.statusCode).toEqual(400);
        expect(result.headers).toEqual({
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Methods': 'POST',
            'Access-Control-Allow-Origin': '*',
        });
        expect(result.body).toEqual(
            JSON.stringify({
                message: 'Request body validation failed',
                data: {
                    issues: [
                        {
                            code: 'invalid_type',
                            expected: 'string',
                            received: 'number',
                            path: ['firstName'],
                            message: 'Expected string, received number',
                        },
                    ],
                    name: 'ZodError',
                },
            }),
        );
    });
    it('should throw an error when "lastName" is not a string', async () => {
        // Set variables
        const firstName = 'Jasper';
        const lastName = false;
        apiGatewayEvent.body = JSON.stringify({
            firstName,
            lastName,
        });

        const result = await lambdaHandler(apiGatewayEvent);
        expect(result.statusCode).toEqual(400);
        expect(result.headers).toEqual({
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Methods': 'POST',
            'Access-Control-Allow-Origin': '*',
        });
        expect(result.body).toEqual(
            JSON.stringify({
                message: 'Request body validation failed',
                data: {
                    issues: [
                        {
                            code: 'invalid_type',
                            expected: 'string',
                            received: 'boolean',
                            path: ['lastName'],
                            message: 'Expected string, received boolean',
                        },
                    ],
                    name: 'ZodError',
                },
            }),
        );
    });
});
