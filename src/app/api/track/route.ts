import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { hashApiKey } from '@/src/lib/crypto';
import { TrackEventSchema } from '@/src/lib/validations/events.schema';
import UAParser from 'ua-parser-js';

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      // todo add domain in cors
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = TrackEventSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: validation.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const data = validation.data;
    const hashedApiKey = hashApiKey(data.apiKey);

    const apiKey = await prisma.apiKey.findUnique({
      where: { hashKey: hashedApiKey, isActive: true },
      select: {
        id: true,
        org: true
      }
    });

    if (!apiKey) {
      return NextResponse.json({ error: 'Invalid or incorrect apiKey' }, { status: 401 });
    }

    let browser: string | null = null;
    let os: string | null = null;

    if (data.userAgent) {
      try {
        const parser = new UAParser(data.userAgent);
        const browserInfo = parser.getBrowser();
        const osInfo = parser.getOS();

        browser = browserInfo.name
          ? `${browserInfo.name}${browserInfo.version ? ` ${browserInfo.version}` : ''}`
          : null;

        os = osInfo.name ? `${osInfo.name}${osInfo.version ? ` ${osInfo.version}` : ''}` : null;
      } catch (err) {
        console.error('Failed to parse user agent:', err);
      }
    }

    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      request.headers.get('cf-connecting-ip') ||
      null;

    const deviceType =
      data.device && ['desktop', 'mobile', 'tablet'].includes(data.device)
        ? data.device
        : 'desktop';

    let clientTimestamp: Date | null = null;
    if (data.clientTimestamp) {
      try {
        clientTimestamp = new Date(data.clientTimestamp);
        const now = Date.now();
        const clientTime = clientTimestamp.getTime();
        if (clientTime > now + 60000 || clientTime < now - 86400000 * 7) {
          clientTimestamp = null;
        }
      } catch {
        clientTimestamp = null;
      }
    }

    const event = await prisma.event.create({
      data: {
        org: {
          connect: {
            id: apiKey.orgId
          }
        },

        eventName: data.eventName,
        eventData: data.eventData || null,
        visitorsId: data.visitorsId || null,
        sessionId: data.sessionId || null,
        pageUrl: data.pageUrl || null,
        pageTitle: data.pageTitle || null,
        referrer: data.referrer || null,
        browser,
        os,
        device: deviceType,
        userAgent: data.userAgent || null,
        ipAddress,
        receivedAt: new Date(),
        clientTimestamp
      }
    });

    prisma.apiKey
      .update({
        where: { id: apiKey.id },
        data: { lastUsed: new Date() }
      })
      .catch((error) => {
        console.error('Failed to update API key lastUsed:', error);
      });

    return NextResponse.json(
      {
        success: true,
        eventId: event.id
      },
      {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      }
    );
  } catch (error) {
    console.error('Event tracking error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error: Failed to track event',
        message: error instanceof Error ? error : 'Unknown error'
      },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
}
