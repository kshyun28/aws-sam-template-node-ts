import AWS from 'aws-sdk-mock';
import { lambdaHandler } from './post';

describe('Unit test for post handler', function () {
    it('verifies successful response', async () => {
        const event = {
            httpMethod: 'post',
            body: '{"partitionKey":"PK","sortKey":"SK"}',
            headers: {},
            isBase64Encoded: false,
            multiValueHeaders: {},
            multiValueQueryStringParameters: {},
            path: '/post',
            pathParameters: {},
            queryStringParameters: {},
            requestContext: {
                accountId: '123456789012',
                apiId: '1234',
                authorizer: {},
                httpMethod: 'post',
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
                path: '/post',
                protocol: 'HTTP/1.1',
                requestId: 'c6af9ac6-7b61-11e6-9a41-93e8deadbeef',
                requestTimeEpoch: 1428582896000,
                resourceId: '123456',
                resourcePath: '/',
                stage: 'dev',
            },
            resource: '',
            stageVariables: {},
        };

        AWS.mock('DynamoDB.DocumentClient', 'put', (params: any, callback: any) => {
            callback(null, null);
        });
        const result = await lambdaHandler(event);

        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(
            JSON.stringify({
                message: 'Success',
                data: {
                    partitionKey: 'PK',
                    sortKey: 'SK',
                }
            }),
        );

        AWS.restore('DynamoDB.DocumentClient');
    });
});
