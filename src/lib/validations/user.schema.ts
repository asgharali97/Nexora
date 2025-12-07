import { z } from 'zod';

const userSchema = z.object({
  name: z.string().min(3),
  email: z.email(),
  password: z.string().min(6)
});

export default userSchema;
