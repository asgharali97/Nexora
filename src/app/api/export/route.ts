import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { format } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const eventType = searchParams.get('eventType');
    const device = searchParams.get('device');
    const pageUrl = searchParams.get('pageUrl');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Start date and end date are required' },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const whereClause: any = {
      receivedAt: {
        gte: start,
        lte: end,
      },
    };

    if (eventType && eventType !== 'all') {
      whereClause.eventName = eventType;
    }

    if (device && device !== 'all') {
      whereClause.device = device;
    }

    if (pageUrl) {
      whereClause.pageUrl = {
        contains: pageUrl,
        mode: 'insensitive',
      };
    }

    const events = await prisma.event.findMany({
      where: whereClause,
      orderBy: { receivedAt: 'desc' },
      select: {
        id: true,
        receivedAt: true,
        eventName: true,
        pageUrl: true,
        pageTitle: true,
        visitorId: true,
        sessionId: true,
        device: true,
        browser: true,
        os: true,
      },
    });

    const headers = [
      'ID',
      'Timestamp',
      'Event Name',
      'Page URL',
      'Page Title',
      'Visitor ID',
      'Session ID',
      'Device',
      'Browser',
      'OS',
    ];

    const csvRows = [headers.join(',')];

    events.forEach((event) => {
      const row = [
        event.id,
        format(event.receivedAt, 'yyyy-MM-dd HH:mm:ss'),
        `"${event.eventName}"`,
        `"${event.pageUrl}"`,
        `"${event.pageTitle || ''}"`,
        event.visitorId,
        event.sessionId,
        event.device || 'Unknown',
        event.browser || 'Unknown',
        event.os || 'Unknown',
      ];
      csvRows.push(row.join(','));
    });

    const csv = csvRows.join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="analytics-export-${format(new Date(), 'yyyy-MM-dd')}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export API Error:', error);
    return NextResponse.json(
      { error: 'Failed to export analytics data' },
      { status: 500 }
    );
  }
}