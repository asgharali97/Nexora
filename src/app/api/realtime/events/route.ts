import { NextRequest } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { user } from '@/src/lib/user';
import { removeConnection, addConnection } from '@/src/lib/realtimeEvent';
import { ensureRealtimeInitialized } from '@/src/lib/realTimeInit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  ensureRealtimeInitialized();
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
    const orgId = org?.orgId;

    if (!orgId) {
      return new Response('Missing orgId', { status: 400 });
    }

    const member = await prisma.membership.findFirst({
      where: {
        userId: session.user.id,
        orgId: orgId
      }
    });
    if (!member) {
      return new Response('Forbidden', { status: 403 });
    }

    const [recentEvents, stats] = await Promise.all([
      prisma.event.findMany({
        where: { orgId },
        orderBy: { receivedAt: 'desc' },
        take: 50,
        select: {
          id: true,
          eventName: true,
          pageUrl: true,
          pageTitle: true,
          device: true,
          browser: true,
          os: true,
          visitorsId: true,
          sessionId: true,
          receivedAt: true,
          clientTimestamp: true
        }
      }),

      prisma.$transaction([
        // Total events
        prisma.event.count({ where: { orgId } }),

        prisma.event.groupBy({
          by: ['visitorsId'],
          where: {
            orgId,
            visitorsId: { not: null }
          }
        }),

        prisma.event.groupBy({
          by: ['sessionId'],
          where: {
            orgId,
            sessionId: { not: null },
            receivedAt: {
              gte: new Date(Date.now() - 30 * 60 * 1000)
            }
          }
        })
      ])
    ]);

    const initialStats = {
      totalEvents: stats[0],
      uniqueVisitors: stats[1].length,
      activeSessions: stats[2].length
    };

    console.log('[SSE API] Initial data loaded:', {
      events: recentEvents.length,
      stats: initialStats
    });

    const encoder = new TextEncoder();
    let isClosed = false;
    let connectionId: string | null = null;

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
        const sendRawMessage = (messageStr: string) => {
          if (isClosed) return;
          try {
            controller.enqueue(encoder.encode(messageStr));
          } catch (error) {
            console.error('[SSE API] Error sending raw message:', error);
          }
        };

        connectionId = addConnection(orgId, sendRawMessage, encoder);
        console.log('[SSE API] Connection registered:', connectionId);

        sendMessage('connected', {
          orgId,
          userId: session.user.id,
          connectionId
        });

        sendMessage('stats_update', initialStats);

        recentEvents.forEach((event) => {
          sendMessage('new_event', event);
        });

        console.log('[SSE API] Initial data sent, connection ready');

        const cleanup = () => {
          if (isClosed) return;
          isClosed = true;

          console.log('[SSE API] Cleaning up connection:', connectionId);

          if (connectionId) {
            removeConnection(orgId, connectionId);
          }

          try {
            controller.close();
          } catch {}
        };

        req.signal.addEventListener('abort', cleanup);
      },

      cancel() {
        console.log('[SSE API] Stream cancelled');
        isClosed = true;
        if (connectionId) {
          removeConnection(orgId, connectionId);
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
