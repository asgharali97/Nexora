import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma'; 
import UAParser from 'ua-parser-js';


export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      apiKey,
      eventName,
      eventData = {},
      visitorId,
      sessionId,
      pageUrl,
      pageTitle,
      referrer,
      userAgent,
      device,
      timestamp,
    } = body;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { 
          status: 401,
          headers: { 'Access-Control-Allow-Origin': '*' }
        }
      );
    }

    const apiKeyRecord = await prisma.apiKey.findUnique({
      where: { key: apiKey },
      include: {
        org: true,
      },
    });

    if (!apiKeyRecord) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { 
          status: 401,
          headers: { 'Access-Control-Allow-Origin': '*' }
        }
      );
    }

    if (!apiKeyRecord.isActive) {
      return NextResponse.json(
        { error: 'API key is disabled' },
        { 
          status: 403,
          headers: { 'Access-Control-Allow-Origin': '*' }
        }
      );
    }

    prisma.apiKey.update({
      where: { id: apiKeyRecord.id },
      data: { lastUsed: new Date() },
    }).catch(err => console.error('Failed to update lastUsed:', err));

    let browser = 'Unknown';
    let os = 'Unknown';

    if (userAgent) {
      try {
        const parser = new UAParser(userAgent);
        const browserInfo = parser.getBrowser();
        const osInfo = parser.getOS();
        
        browser = browserInfo.name || 'Unknown';
        os = osInfo.name || 'Unknown';
      } catch (err) {
        console.error('Failed to parse user agent:', err);
      }
    }

    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      null;

    if (!eventName || !visitorId || !sessionId || !pageUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: eventName, visitorId, sessionId, pageUrl' },
        { 
          status: 400,
          headers: { 'Access-Control-Allow-Origin': '*' }
        }
      );
    }

    const event = await prisma.event.create({
      data: {
        projectId: apiKeyRecord.orgId,
        
        eventName: eventName,
        eventData: eventData, 
        
        visitorsId: visitorId,
        sessionId: sessionId,
        
        pageUrl: pageUrl,
        pageTitle: pageTitle || null,
        referrer: referrer || null,
        
        browser: browser,
        os: os,
        device: device || 'unknown',
        userAgent: userAgent || null,
        
        ipAddress: ipAddress,
        city: null,
        country: null,
        
        timestamp: timestamp ? new Date(timestamp) : new Date(),
      },
    });

    return NextResponse.json(
      {
        success: true,
        eventId: event.id,
      },
      {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
    );

  } catch (error) {
    console.error('Event tracking error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to track event',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}