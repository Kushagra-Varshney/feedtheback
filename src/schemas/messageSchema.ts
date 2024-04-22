import {z} from 'zod';

export const messageSchema = z.object({
    content: z
        .string()
        .min(1, {message: "Message must not be empty"})
        .max(200, {message: "Message cannot be longer than 200 characters"}),
});