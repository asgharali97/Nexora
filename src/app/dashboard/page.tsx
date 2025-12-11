import { getServerSession } from 'next-auth';
import { authOptions } from '@/src/lib/auth';
import { prisma } from '@/src/lib/prisma';
import { redirect } from 'next/navigation';

export default async function dashboardRedirect() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/signin');

  const membership = await prisma.membership.findFirst({
    where: { userId: session?.user.id },
    include: { org: true }
  });

  if (!membership) {
    redirect('/onboarding');
  }

  redirect(`/${membership.org.slug}/dashboard`);
  
}
