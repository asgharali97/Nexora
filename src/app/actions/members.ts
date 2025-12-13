'use server';
import { user } from '@/src/lib/user';
import { prisma } from '@/src/lib/prisma';
import { revalidatePath } from 'next/cache';
import { Role } from '@/generated/prisma/enums';
import { addMemberSchema } from '@/src/lib/validations/org.schema';

export async function checkPermision(orgId: string, requiredRole: Role[]) {
  const session = await user();

  if (!session?.user) {
    throw new Error('Unauthenticated');
  }

  const membership = await prisma.membership.findUnique({
    where: {
      userId_orgId: {
        orgId: orgId,
        userId: session.user.id
      }
    }
  });

  if (!membership || !requiredRole.includes(membership.role)) {
    throw new Error('insefficent permisions');
  }
  return { userId: session.user.id, role: membership.role };
}

export async function addMember(prevState: ActionState | null, formData: FormData) {
  if (!formData || !(formData instanceof FormData)) {
      return { error: 'Invalid form submission' };
  }

  try{
  const orgId = formData.get('orgId') as string;
  const role = (formData.get('role') as Role) || 'MEMBER';
  const email = formData.get('email') as string;

  const validatedData = addMemberSchema.safeParse({ orgId, email, role });

  if (!validatedData.success) {
    return { error: 'Please provide valid data' };
  }
    await checkPermision(orgId, ['OWNER', 'ADMIN']);
    const userToAdd = await prisma.user.findUnique({
      where: {
        email
      }
    });

    if (!userToAdd) {
      return { error: 'User not found with that email' };
    }

    const existingMemebership = await prisma.membership.findUnique({
      where: {
        userId_orgId: {
          orgId,
          userId: userToAdd.id
        }
      }
    });

    if (existingMemebership) {
      return { error: 'User already exits in Oraganization' };
    }

    const addMembership = await prisma.membership.create({
      data: {
        role,
        orgId,
        userId: userToAdd.id
      }
    });

    if (!addMembership) {
      return { error: 'Failed to add member' };
    }

    revalidatePath(`/[orgSlug]/settings/members`);
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function remvoeMember(formData: FormData) {
  
  const membershipId = formData.get('membershipId') as string;
  const orgId = formData.get('orgId') as string;

  if (!membershipId || !orgId) {
    return { error: 'Please orgId and membershipId' };
  }

  try {
    const { userId, role } = await checkPermision(orgId, ['OWNER', 'ADMIN']);

    const membershipToRemove = await prisma.membership.findUnique({
      where: {
        id: membershipId
      },
      include: {
        user: true
      }
    });

    if (!membershipToRemove) {
      return { error: 'member not found' };
    }

    if (membershipToRemove.role === 'OWNER') {
      return { error: "Can't remove owner of organization" };
    }

    if (role === 'ADMIN' && membershipToRemove.role === 'ADMIN') {
      return { error: 'Only owner can remove admins' };
    }

    const remvoeMember = await prisma.membership.delete({
      where: { id: membershipId }
    });

    if (!remvoeMember) {
      return { error: 'got error while removeing member from organization' };
    }

    revalidatePath(`/[orgSlug]/settings/members`);
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updateMember(formData: FormData) {
  const orgId = formData.get('orgId') as string;
  const membershipId = formData.get('membershipId') as string;
  const newRole = formData.get('role') as Role;

  if (!orgId || !membershipId || !newRole) {
    return { error: 'Please provide valid fields to update member' };
  }

  try {
    await checkPermision(orgId, ['OWNER']);

    const membership = await prisma.membership.findUnique({
      where: { id: membershipId }
    });

    if (!membership) {
      return { error: 'Member not found' };
    }

    if (membership.role === 'OWNER') {
      return { error: 'Cannot change owner role' };
    }

    const updateMemberShip = await prisma.membership.update({
      where: { id: membershipId },
      data: { role: newRole }
    });

    if (!updateMemberShip) {
      return { error: 'failed to update member' };
    }

    revalidatePath(`/[orgSlug]/settings/members`);
    return { success: true };

  } catch (error:any) {
    return {error:error.message}
  }
}
