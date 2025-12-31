import { NextRequest } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { user } from '@/src/lib/user';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  console.log('[SSE API] Request received');

  try {
    const session = await user();
    if (!session?.user?.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const orgSlug = searchParams.get('orgId');

    if (!orgSlug) {
      return new Response('Missing orgId', { status: 400 });
    }
    const org = await prisma.membership.findFirst({
      where: { userId: session?.user.id },
      include: { org: true }
    });
    const orgId = org?.orgId
    const member = await prisma.membership.findFirst({
      where: {
        userId: session.user.id,
        orgId: orgId
      }
    });
    if (!member) {
      return new Response('Forbidden', { status: 403 });
    }


    const encoder = new TextEncoder();
    let isClosed = false;
    let pingInterval: NodeJS.Timeout | null = null;

    const stream = new ReadableStream({
      start(controller) {

        const sendMessage = (type: string, payload?: any) => {
          if (isClosed) return;

          try {
            const message = {
              type,
              timestamp: new Date().toISOString(),
              payload
            };

            const data = `data: ${JSON.stringify(message)}\n\n`;
            controller.enqueue(encoder.encode(data));
          } catch (error) {
            cleanup();
          }
        };

        const cleanup = () => {
          if (isClosed) return;
          isClosed = true;
          if (pingInterval) {
            clearInterval(pingInterval);
            pingInterval = null;
          }

          try {
            controller.close();
          } catch (error) {
            console.error('[SSE API] Error closing controller:', error);
          }
        };

        sendMessage('connected', { orgId, userId: session.user.id });

        sendMessage('stats_update', {
          totalEvents: 0,
          uniqueVisitors: 0,
          activeSessions: 1
        });

        pingInterval = setInterval(() => {
          sendMessage('ping');
        }, 15000); 

        req.signal.addEventListener('abort', () => {
          cleanup();
        });
      },

      cancel() {
        isClosed = true;
        if (pingInterval) {
          clearInterval(pingInterval);
        }
      }
    });


    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no'
      }
    });
  } catch (error) {
    console.error('[SSE API] Unexpected error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
