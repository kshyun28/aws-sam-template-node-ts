import { APIGatewayEvent } from 'aws-lambda';

import { config } from 'src/config/config';
import { userService } from 'src/services';

import { lambdaHandler } from './update';

let apiGatewayEvent: APIGatewayEvent;

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

    it('should update a user', async () => {
        // Set variables
        const userId = '442bf4eb-4d25-49fe-812b-02687f7fa109';
        const user = {
            created: 1681977346831,
            verified: true,
            firstName: 'Jasper',
            lastName: 'Gabriel',
            userId,
        };
        const verified = true;
        apiGatewayEvent.pathParameters = {
            userId,
        };
        apiGatewayEvent.body = JSON.stringify({
            verified,
        });

        // Mock functions
        jest.spyOn(userService, 'updateUser').mockReturnValue(Promise.resolve(user));

        const result = await lambdaHandler(apiGatewayEvent);
        expect(result.statusCode).toEqual(200);
        expect(result.headers).toEqual({
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Methods': 'PATCH',
            'Access-Control-Allow-Origin': '*',
        });
        expect(result.body).toEqual(
            JSON.stringify({
                message: 'Successfully updated user',
                data: user,
            }),
        );
    });
    it('should throw an error when "verified" is not a boolean', async () => {
        // Set variables
        const userId = '442bf4eb-4d25-49fe-812b-02687f7fa109';
        const verified = 'true';
        apiGatewayEvent.pathParameters = {
            userId,
        };
        apiGatewayEvent.body = JSON.stringify({
            verified,
        });

        const result = await lambdaHandler(apiGatewayEvent);
        expect(result.statusCode).toEqual(400);
        expect(result.headers).toEqual({
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Methods': 'PATCH',
            'Access-Control-Allow-Origin': '*',
        });
        expect(result.body).toEqual(
            JSON.stringify({
                message: 'Request body validation failed',
                data: {
                    issues: [
                        {
                            code: 'invalid_type',
                            expected: 'boolean',
                            received: 'string',
                            path: ['verified'],
                            message: 'Expected boolean, received string',
                        },
                    ],
                    name: 'ZodError',
                },
            }),
        );
    });
});
