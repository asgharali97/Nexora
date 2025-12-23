import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { user } from '@/src/lib/user';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { keyId: string } }
) {
  try {
    const session = await user()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { keyId } = params;
    const body = await req.json();
    const { isActive } = body;

    if (typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'isActive must be a boolean' },
        { status: 400 }
      );
    }


    const apiKey = await prisma.apiKey.findUnique({
      where: { id: keyId },
      include: {
        org: {
          include: {
            memberships: {
              where: {
                userId: session.user.id,
              },
            },
          },
        },
      },
    });

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not found' },
        { status: 404 }
      );
    }

    if (apiKey.org.memberships.length === 0) {
      return NextResponse.json(
        { error: 'You do not have access to this API key' },
        { status: 403 }
      );
    }

    const updatedKey = await prisma.apiKey.update({
      where: { id: keyId },
      data: { isActive },
      select: {
        id: true,
        name: true,
        key: true,
        isActive: true,
        lastUsed: true,
        createdAt: true,
      },
    });

    return NextResponse.json(updatedKey);
  } catch (error) {
    console.error('Error updating API key:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { keyId: string } }
) {
  try {
    const session = await user()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { keyId } = params;

    const apiKey = await prisma.apiKey.findUnique({
      where: { id: keyId },
      include: {
        org: {
          include: {
            memberships: {
              where: {
                userId: session.user.id,
              },
            },
          },
        },
      },
    });

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not found' },
        { status: 404 }
      );
    }

    if (apiKey.org.memberships.length === 0) {
      return NextResponse.json(
        { error: 'You do not have access to this API key' },
        { status: 403 }
      );
    }

    await prisma.apiKey.delete({
      where: { id: keyId },
    });

    return NextResponse.json(
      { message: 'API key deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting API key:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}