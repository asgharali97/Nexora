import { user } from '@/src/lib/user';
import { prisma } from '@/src/lib/prisma';
import { redirect } from 'next/navigation';
import AddMembers from '@/src/components/AddMembers';
import MembersList from '@/src/components/MembersList';
 
const MembersPage = async ({ params }: { params: { orgSlug: string } }) => {
  const {orgSlug} = await params;
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
    <>
      <div className="min-h-screen w-full py-12">
        <h1 className="text-bold text-4xl text-center my-4">Team Members</h1>
        {canManageMembers && (
          <div className="h-full w-full flex justify-center items-center">
            <AddMembers orgId={org.id}/>
          </div>
        )}

        <MembersList
          members={org.memberships}
          currentUserRole={currentUserMembership.role}
          orgId={org.id}
        />
      </div>
    </>
  );
};

export default MembersPage;
