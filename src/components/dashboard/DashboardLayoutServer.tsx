import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/src/lib/prisma';
import { authOptions } from '@/src/lib/auth';
import { DashboardLayout } from './DashboardLayout';

interface DashboardLayoutServerProps {
  children: React.ReactNode;
  orgSlug: string;
}

export async function DashboardLayoutServer({
  children,
  orgSlug,
}: DashboardLayoutServerProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const organization = await prisma.organization.findUnique({
    where: { slug: orgSlug },
    include: {
      memberships: {
        where: {
          userId: session.user.id,
        },
      },
    },
  });

  if (!organization || organization.memberships.length === 0) {
    redirect('/'); 
  }

  return (
    <DashboardLayout
      orgSlug={orgSlug}
      orgName={organization.name}
      userEmail={session.user.email || undefined}
    >
      {children}
    </DashboardLayout>
  );
}