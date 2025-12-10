import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

export async function user() {
  return await getServerSession(authOptions);
}