import { injectLambdaContext } from '@aws-lambda-powertools/logger';
import { logMetrics } from '@aws-lambda-powertools/metrics';
import { captureLambdaHandler } from '@aws-lambda-powertools/tracer';
import middy from '@middy/core';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

import { generateResponse } from '/opt/nodejs/utils/jsonResponse';
import { logger, metrics, tracer } from '/opt/nodejs/utils/powertools';

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
    const docClient = new DocumentClient();
    const headers = {
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Origin': '*',
    };
    let response: APIGatewayProxyResult;

    try {
        logger.info('Sample post function logger');
        if (!event.body) {
            throw Error('request body is null');
        }
        if (!tableName) {
            throw Error('tablename undefined');
        }

        const body = JSON.parse(event.body);
        const { partitionKey, sortKey } = body;

        await docClient
            .put({
                TableName: tableName,
                Item: { partition_key: partitionKey, sort_key: sortKey },
            })
            .promise();

        response = generateResponse(200, headers, 'Success', body);
    } catch (err: unknown) {
        logger.error('Error', {
            error: err,
        });
        const message = err instanceof Error ? err.message : 'some error happened';
        response = generateResponse(500, headers, message, null);
    }

    return response;
};

export const handler = middy(lambdaHandler)
    .use(captureLambdaHandler(tracer))
    .use(logMetrics(metrics, { captureColdStartMetric: true }))
    .use(injectLambdaContext(logger, { clearState: true }));
