import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { user } from '@/src/lib/user';
import { generateApiKey, hashApiKey } from '@/src/lib/crypto';
import { CreateApiKeySchema } from '@/src/lib/validations/apiKey.schema';

export async function POST(req: NextRequest) {
  try {
    const session = await user();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validation = CreateApiKeySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: validation.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const { name, orgId } = validation.data;

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

    const plainApiKey = generateApiKey();
    const hashedApiKey = hashApiKey(plainApiKey);

    const newKey = await prisma.apiKey.create({
      data: {
        name,
        hashKey: hashedApiKey,
        orgId,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        hashKey: true,
        orgId: true,
        isActive: true,
        createdAt: true,
        lastUsed: true
      }
    });

    return NextResponse.json(
      {
        ...newKey,
        key: plainApiKey
      },
      { status: 201 }
    );
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
        hashKey: true,
        isActive: true,
        lastUsed: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const maskedKeys = apiKeys.map((key) => ({
      ...key,
      key: `${key.hashKey.substring(0, 12)}...${key.hashKey.substring(key.hashKey.length - 4)}`,
      keyHash: undefined,
    }));

    return NextResponse.json(maskedKeys);

  } catch (error) {
    console.error('Error fetching API keys:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
