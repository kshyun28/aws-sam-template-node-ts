import { APIGatewayProxyEvent } from 'aws-lambda';

import { BadRequestError } from 'src/errors';

import { logger } from '/opt/nodejs/utils/powertools';

export const parseAndValidateRequestBody = (event: APIGatewayProxyEvent, schema: Zod.AnyZodObject | Zod.ZodUnion<any>) => {
    if (!event.body) {
        throw new BadRequestError('Request body is undefined');
    }
    const body = JSON.parse(event.body);
    const validation = schema.safeParse(body);
    logger.info('Request Body Validation', { data: validation });
    if (!validation.success) {
        throw new BadRequestError('Request body validation failed', validation.error);
    }
    return validation.data;
};
