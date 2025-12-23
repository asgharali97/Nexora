import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import crypto from 'crypto';
import { user } from '@/src/lib/user';

function generateApiKey(): string {
  const prefix = 'nx'; 
  const randomBytes = crypto.randomBytes(32).toString('hex');
  return `${prefix}_${randomBytes}`;
}

export async function POST(req: NextRequest) {
  try {
    const session = await user();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, orgId } = body;

    if (!name || !orgId) {
      return NextResponse.json({ error: 'Name and orgId are required' }, { status: 400 });
    }

    const member = await prisma.membership.findFirst({
      where: {
        userId: session.user.id,
        orgId: orgId
      }
    });

    if (!member) {
      return NextResponse.json(
        { error: 'You do not have access to this organization' },
        { status: 403 }
      );
    }

    const apiKey = generateApiKey();

    const newKey = await prisma.apiKey.create({
      data: {
        name,
        key: apiKey,
        orgId,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        key: true,
        orgId: true,
        isActive: true,
        createdAt: true,
        lastUsed: true
      }
    });

    return NextResponse.json(newKey, { status: 201 });
  } catch (error) {
    console.error('Error creating API key:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await user();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get('orgId');

    if (!orgId) {
      return NextResponse.json({ error: 'orgId is required' }, { status: 400 });
    }

    const member = await prisma.membership.findFirst({
      where: {
        userId: session.user.id,
        orgId: orgId
      }
    });

    if (!member) {
      return NextResponse.json(
        { error: 'You do not have access to this organization' },
        { status: 403 }
      );
    }

    const apiKeys = await prisma.apiKey.findMany({
      where: {
        orgId
      },
      select: {
        id: true,
        name: true,
        key: true,
        isActive: true,
        lastUsed: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(apiKeys);
  } catch (error) {
    console.error('Error fetching API keys:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
