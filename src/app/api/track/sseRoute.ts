import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { hashApiKey } from '@/src/lib/crypto';
import { TrackEventSchema } from '@/src/lib/validations/events.schema';
import UAParser from 'ua-parser-js';

/**
 * POST /api/track
 * 
 * Receives and processes analytics tracking events from client websites.
 * 
 * Flow:
 * 1. Parse and validate incoming event data
 * 2. Validate API key (hashed comparison)
 * 3. Extract browser/OS info from user agent
 * 4. Get IP address for geolocation
 * 5. Store event in database
 * 6. Broadcast to SSE connections (non-blocking)
 * 7. Update API key last used timestamp
 * 
 * Security:
 * - API key validation via hash comparison
 * - Input validation with Zod
 * - Rate limiting should be added (future enhancement)
 * 
 * Performance:
 * - SSE broadcast is non-blocking (fire and forget)
 * - API key lastUsed update is non-blocking
 * - Optimized for fast event ingestion
 * 
 * @param req - Next.js request object
 * @returns JSON response with success status
 */
export async function POST(req: NextRequest) {
  try {
    // Step 1: Parse request body
    const body = await req.json();

    // Step 2: Validate input with Zod
    const validation = TrackEventSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: validation.error.flatten().fieldErrors 
        },
        { 
          status: 400,
          headers: getCorsHeaders(),
        }
      );
    }

    const data = validation.data;

    // Step 3: Hash the provided API key for comparison
    const hashedApiKey = hashApiKey(data.apiKey);

    // Step 4: Validate API key (compare hashed version)
    const apiKey = await prisma.apiKey.findUnique({
      where: { 
        keyHash: hashedApiKey,
        isActive: true,
      },
      select: {
        id: true,
        orgId: true,
      },
    });

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Invalid or inactive API key' },
        { 
          status: 401,
          headers: getCorsHeaders(),
        }
      );
    }

    // Step 5: Parse user agent for browser/OS detection
    let browser: string | null = null;
    let os: string | null = null;
    
    if (data.userAgent) {
      const parser = new UAParser(data.userAgent);
      const browserInfo = parser.getBrowser();
      const osInfo = parser.getOS();
      
      browser = browserInfo.name 
        ? `${browserInfo.name}${browserInfo.version ? ` ${browserInfo.version}` : ''}`
        : null;
      
      os = osInfo.name
        ? `${osInfo.name}${osInfo.version ? ` ${osInfo.version}` : ''}`
        : null;
    }

    // Step 6: Extract IP address from request headers
    const ipAddress = 
      req.headers.get('x-forwarded-for')?.split(',')[0] ||
      req.headers.get('x-real-ip') ||
      req.headers.get('cf-connecting-ip') ||
      null;

    // Step 7: Normalize device type
    const deviceType = data.device && ['desktop', 'mobile', 'tablet'].includes(data.device)
      ? data.device
      : 'desktop';

    // Step 8: Parse client timestamp if provided
    let clientTimestamp: Date | null = null;
    if (data.clientTimestamp) {
      try {
        clientTimestamp = new Date(data.clientTimestamp);
        
        // Validate it's a reasonable date
        const now = Date.now();
        const clientTime = clientTimestamp.getTime();
        
        // Reject if more than 1 min in future or 7 days in past
        if (clientTime > now + 60000 || clientTime < now - 86400000 * 7) {
          clientTimestamp = null;
        }
      } catch {
        clientTimestamp = null;
      }
    }

    // Step 9: Store event in database
    const event = await prisma.event.create({
      data: {
        orgId: apiKey.orgId,
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
        clientTimestamp,
      },
    });

    // Step 10: Broadcast to SSE connections (non-blocking)
    // This is the critical bridge between ingestion and real-time updates
    // We don't await this - it happens asynchronously
    realtimeEvents.broadcast(apiKey.orgId, {
      type: 'new_event',
      timestamp: new Date().toISOString(),
      payload: {
        id: event.id,
        eventName: event.eventName,
        pageUrl: event.pageUrl,
        pageTitle: event.pageTitle,
        device: event.device,
        browser: event.browser,
        os: event.os,
        visitorsId: event.visitorsId,
        sessionId: event.sessionId,
        receivedAt: event.receivedAt,
        clientTimestamp: event.clientTimestamp,
      },
    });

    // Step 11: Update API key last used timestamp (non-blocking)
    // Fire and forget - don't wait for this to complete
    prisma.apiKey
      .update({
        where: { id: apiKey.id },
        data: { lastUsed: new Date() },
      })
      .catch((error) => {
        // Log error but don't fail the request
        console.error('[Track] Failed to update API key lastUsed:', error);
      });

    // Step 12: Return success response immediately
    return NextResponse.json(
      {
        success: true,
        eventId: event.id,
      },
      { 
        status: 200,
        headers: getCorsHeaders(),
      }
    );
  } catch (error) {
    console.error('[Track] Error processing event:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { 
        status: 500,
        headers: getCorsHeaders(),
      }
    );
  }
}

/**
 * OPTIONS /api/track
 * 
 * Handle CORS preflight requests
 */
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: getCorsHeaders(),
    }
  );
}

/**
 * Returns CORS headers for cross-origin requests
 * 
 * The tracking endpoint needs to accept requests from any domain
 * since it's called from client websites
 */
function getCorsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}