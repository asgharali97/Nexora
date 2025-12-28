import { NextRequest } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { user } from '@/src/lib/user';
import * as realtimeEvents from '@/src/lib/realtimeEvent';

/**
 * flow: of api
 * 1. Authenticate user session
 * 2. Validate orgId parameter
 * 3. Verify user has access to organization
 * 4. Open SSE stream with proper headers
 * 5. Register connection in memory
 * 6. Send initial connection confirmation
 * 7. Keep connection alive until client disconnects
 *
 * @param req - Next.js request object with orgId query params
 * @returns SSE stream response
 */
export async function GET(req: NextRequest) {
  try {
    const session = await user();

    if (!session?.user?.id) {
      return new Response('Unauthorized - Authentication required', {
        status: 401
      });
    }

    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get('orgId');

    if (!orgId) {
      return new Response('Bad Request orgId parameter is required', {
        status: 400
      });
    }

    const member = await prisma.membership.findFirst({
      where: {
        userId: session.user.id,
        orgId: orgId
      },
      select: {
        id: true,
        role: true
      }
    });

    if (!member) {
      return new Response('Forbidden  You do not have access to this organization', {
        status: 403,
      });
    }

    console.log(`[SSE] Opening connection for user ${session.user.id} to org ${orgId}`);

    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    const encoder = new TextEncoder();

    const connectionId = realtimeEvents.addConnection(orgId, writer, encoder);

    const initialMessage = {
      type: 'connected',
      timestamp: new Date().toISOString(),
      payload: {
        connectionId,
        orgId
      }
    };

    try {
      const messageStr = `data: ${JSON.stringify(initialMessage)}\n\n`;
      await writer.write(encoder.encode(messageStr));
    } catch (error) {
      console.error('[SSE] Failed to send initial message:', error);
    }

    return new Response(stream.readable, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true',
      }
    });
  } catch (error) {
    console.error('[SSE] Error opening connection:', error);

    return new Response('Internal Server Error', {
      status: 500,
      headers: {
        'Content-Type': 'text/plain'
      }
    });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    }
  });
}
