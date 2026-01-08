import { user } from '@/src/lib/user';
import { prisma } from '@/src/lib/prisma';
import { redirect } from 'next/navigation';
import SetupPageClient from '@/src/components/SetupPageClient';

const SetupPage = async ({ params }: { params: { orgSlug: string } }) => {
  const { orgSlug } = await params;
  const session = await user();

  if (!session?.user) {
    redirect('/signin');
  }

  const org = await prisma.organization.findUnique({
    where: {
      slug: orgSlug,
    },
    include: {
      apiKeys: {
        where: {
          isActive: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  if (!org) {
    redirect('/dashboard');
  }

  const currentUserMembership = await prisma.membership.findFirst({
    where: {
      userId: session.user.id,
      orgId: org.id,
    },
  });

  if (!currentUserMembership) {
    redirect('/dashboard');
  }

  return <SetupPageClient apiKeys={org.apiKeys} orgSlug={orgSlug} />;
}

export default SetupPage;