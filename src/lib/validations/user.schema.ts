import { z } from 'zod';

const userSchema = z.object({
  name: z.string().min(3, 'the name should be at least 3 characters'),
  email: z.email(),
  password: z.string().min(6, 'the password should be at least 6 characters')
});

const loginUserSchema = z.object({
  email: z.email(),
  password: z.string()
});

export type loginUserInput = z.infer<typeof loginUserSchema>;
export type userInput = z.infer<typeof userSchema>;

export { userSchema, loginUserSchema };
