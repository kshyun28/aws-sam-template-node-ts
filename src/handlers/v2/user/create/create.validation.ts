import { z } from 'zod';

export const CreateUserRequestSchema = z.object({
    firstName: z.string(),
    lastName: z.string(),
});
