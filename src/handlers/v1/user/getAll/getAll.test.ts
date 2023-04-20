import { APIGatewayEvent } from 'aws-lambda';

import { config } from 'src/config/config';
import { userService } from 'src/services';

import { lambdaHandler } from './getAll';

let apiGatewayEvent: APIGatewayEvent;

describe('Get All Users: GET /users', function () {
    beforeEach(() => {
        // Initialize process.env in jest.config.ts
        process.env = { ...config };

        // Initialize API Gateway Event
        apiGatewayEvent = {
            resource: '/users',
            path: '/users',
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
                resourcePath: '/users',
                httpMethod: 'GET',
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

    it('should get a list of users', async () => {
        // Set variables
        const users = [
            {
                created: 1681977346831,
                verified: true,
                firstName: 'Jasper',
                lastName: 'Gabriel',
                userId: '442bf4eb-4d25-49fe-812b-02687f7fa109',
            },
            {
                userId: '09c68aa2-06df-4055-98b1-079e72bbba68',
                created: 1682001139507,
                firstName: 'John',
                lastName: 'Doe',
                verified: false,
            },
        ];

        // Mock functions
        jest.spyOn(userService, 'getAllUsers').mockReturnValue(Promise.resolve(users));

        const result = await lambdaHandler(apiGatewayEvent);
        expect(result.statusCode).toEqual(200);
        expect(result.headers).toEqual({
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Origin': '*',
        });
        expect(result.body).toEqual(
            JSON.stringify({
                message: 'Users list',
                data: users,
            }),
        );
    });
});
