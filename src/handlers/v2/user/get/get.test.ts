import { APIGatewayEvent } from 'aws-lambda';

import { config } from 'src/config/config';
import { userService } from 'src/services';

import { lambdaHandler } from './get';

let apiGatewayEvent: APIGatewayEvent;

describe('Get User: GET /users/{userId}', function () {
    beforeEach(() => {
        // Initialize process.env in jest.config.ts
        process.env = { ...config };

        // Initialize API Gateway Event
        apiGatewayEvent = {
            resource: '/users/{userId}',
            path: '/users/{userId}',
            httpMethod: 'GET',
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
                resourcePath: '/users/{userId}',
                httpMethod: 'GET',
                path: '/users/{userId}',
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

    it('should get a user', async () => {
        // Set variables
        const userId = '442bf4eb-4d25-49fe-812b-02687f7fa109';
        const user = {
            created: 1681977346831,
            verified: true,
            firstName: 'Jasper',
            lastName: 'Gabriel',
            userId,
        };
        apiGatewayEvent.pathParameters = {
            userId,
        };

        // Mock functions
        jest.spyOn(userService, 'getUser').mockReturnValue(Promise.resolve(user));

        const result = await lambdaHandler(apiGatewayEvent);
        expect(result.statusCode).toEqual(200);
        expect(result.headers).toEqual({
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Origin': '*',
        });
        expect(result.body).toEqual(
            JSON.stringify({
                message: 'User details',
                data: user,
            }),
        );
    });
});
