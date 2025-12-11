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

export async function addMember(formData: FormData) {
  const orgId = formData.get('orgId') as string;
  const role = (formData.get('role') as Role) || 'MEMBER';
  const email = formData.get('email') as string;

  const validatedData = addMemberSchema.safeParse({ orgId, email, role });

  if (!validatedData.success) {
    return { error: 'Please provide valid data' };
  }

  try {
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


