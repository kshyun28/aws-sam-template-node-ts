import { z } from 'zod';

export const UpdateUserRequestSchema = z.object({
    verified: z.boolean(),
});
