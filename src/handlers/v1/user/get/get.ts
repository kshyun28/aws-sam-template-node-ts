import { injectLambdaContext } from '@aws-lambda-powertools/logger';
import { logMetrics } from '@aws-lambda-powertools/metrics';
import { captureLambdaHandler } from '@aws-lambda-powertools/tracer';
import middy from '@middy/core';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { BadRequestError } from 'src/errors';
import { BaseError } from 'src/errors/BaseError';
import { userService } from 'src/services';

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
    const headers = {
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Origin': '*',
    };
    let response: APIGatewayProxyResult;

    try {
        /*
            Access path parameters:
            - localhost:3000/get/{id}
            - event.pathParameters.id

            Access query string parameters:
            - localhost:3000/get/{id}?foo=bar
            - event.queryStringParameters
        */
        const userId = event.pathParameters?.userId;
        if (!userId) {
            throw new BadRequestError('User ID is undefined');
        }
        const user = await userService.getUser(userId);

        response = generateResponse(200, headers, 'User details', user);
    } catch (error: unknown) {
        const serializedError = error instanceof BaseError ? error.serializeErrors() : null;
        logger.error('Failed to get user', { error, serializedError });
        const message = error instanceof BaseError ? error.message : 'Some error happened';
        const statusCode = error instanceof BaseError ? error.statusCode : 500;
        const data = error instanceof BaseError ? error.data : null;
        response = generateResponse(statusCode, headers, message, data);
    }

    return response;
};

export const handler = middy(lambdaHandler)
    .use(captureLambdaHandler(tracer))
    .use(logMetrics(metrics, { captureColdStartMetric: true }))
    .use(injectLambdaContext(logger, { clearState: true }));
