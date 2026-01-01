import { prisma } from '@/src/lib/prisma';
import { redirect } from 'next/navigation';
import { user } from '@/src/lib/user';

export default async function dashboardRedirect() {
  const session = await user();
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
