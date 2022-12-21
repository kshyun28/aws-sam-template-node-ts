import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import DynamoDB from 'aws-sdk/clients/dynamodb';
import middy from '@middy/core';
import { generateResponse } from '/opt/nodejs/utils/jsonResponse';
import { logger, metrics, tracer } from '/opt/nodejs/utils/powertools';
import { captureLambdaHandler } from '@aws-lambda-powertools/tracer';
import { injectLambdaContext } from '@aws-lambda-powertools/logger';
import { logMetrics } from '@aws-lambda-powertools/metrics';

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */
export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const tableName = process.env.TABLE_NAME;
    const docClient = new DynamoDB.DocumentClient();
    const headers = {
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Origin': '*',
    };
    let response: APIGatewayProxyResult;

    try {
        logger.info('Sample get function logger');
        /*
            Access path parameters:
            - localhost:3000/get/{id}
            - event.pathParameters.id

            Access query string parameters:
            - localhost:3000/get/{id}?foo=bar
            - event.queryStringParameters
        */
        if (!tableName) {
            throw Error('tablename undefined');
        }
        const data = await docClient.scan({
            TableName: tableName,
        }).promise();
        const items = data.Items;

        response = generateResponse(200, headers, 'Success', items);
    } catch (err: unknown) {
        logger.error('Error', {
            error: err,
        });
        const message = err instanceof Error ? err.message : 'some error happened';
        response = generateResponse(500, headers, message, null);;
    }

    return response;
};

export const handler = middy(lambdaHandler)
    .use(captureLambdaHandler(tracer))
    .use(logMetrics(metrics, { captureColdStartMetric: true }))
    .use(injectLambdaContext(logger, { clearState: true }));
