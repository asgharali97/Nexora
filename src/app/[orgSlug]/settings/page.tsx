import { user } from '@/src/lib/user';
import { prisma } from '@/src/lib/prisma';
import { redirect } from 'next/navigation';
import MembersPageClient from '@/src/components/MembersPageClient';

const SettingsPage = async ({ params }: { params: { orgSlug: string } }) => {
  const { orgSlug } = await params;
  const session = await user();
  
  if (!session?.user) {
    redirect('/signin');
  }

  const org = await prisma.organization.findUnique({
    where: {
      slug: orgSlug
    },
    include: {
      memberships: {
        include: {
          user: true
        },
        orderBy: {
          createdAt: 'asc'
        }
      }
    }
  });

  if (!org) {
    redirect('/dashboard');
  }

  const currentUserMembership = org.memberships.find((m) => m.userId === session.user.id);

  if (!currentUserMembership) {
    redirect('/dashboard');
  }

  const canManageMembers = ['OWNER', 'ADMIN'].includes(currentUserMembership.role);

  return (
    <MembersPageClient
      members={org.memberships}
      currentUserRole={currentUserMembership.role}
      orgId={org.id}
      canManageMembers={canManageMembers}
    />
  );
};

export default SettingsPage;