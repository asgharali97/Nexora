import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { user } from '@/src/lib/user';

export async function GET(req: NextRequest) {
  try {
    const session = await user();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    } 

    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ error: 'slug is required' }, { status: 400 });
    }

    const organization = await prisma.organization.findUnique({
      where: { slug },
      include: {
        memberships: {
          where: {
            userId: session.user.id
          }
        }
      }
    });

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    if (organization.memberships.length === 0) {
      return NextResponse.json(
        { error: 'You do not have access to this organization' },
        { status: 403 }
      );
    }

    const { memberships, ...orgData } = organization;

    return NextResponse.json(orgData);
  } catch (error) {
    console.error('Error fetching organization:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
