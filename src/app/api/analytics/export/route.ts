import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const eventType = searchParams.get('eventType');
    const device = searchParams.get('device');
    const pageUrl = searchParams.get('pageUrl');
    const orgId = searchParams.get('orgId');
    if (!startDate || !endDate) {
      return new NextResponse('Start date and end date are required', {
        status: 400,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const whereClause: any = {
      receivedAt: {
        gte: start,
        lte: end
      }
    };

    if (orgId) {
      whereClause.orgId = orgId;
    }

    if (eventType && eventType !== 'all') {
      whereClause.eventName = eventType;
    }

    if (device && device !== 'all') {
      whereClause.device = device;
    }

    if (pageUrl) {
      whereClause.pageUrl = {
        contains: pageUrl,
        mode: 'insensitive'
      };
    }

    console.log('Export whereClause:', JSON.stringify(whereClause, null, 2));

    const events = await prisma.event.findMany({
      where: whereClause,
      orderBy: { receivedAt: 'desc' },
      take: 10000,
      select: {
        id: true,
        receivedAt: true,
        eventName: true,
        pageUrl: true,
        pageTitle: true,
        visitorsId: true,
        sessionId: true,
        device: true,
        browser: true,
        os: true
      }
    });

    console.log(`Exporting ${events.length} events`);

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
      'OS'
    ];

    const csvRows = [headers.join(',')];

    events.forEach((event) => {
      const escapeCsv = (value: string | null | undefined): string => {
        if (!value) return '';
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      };

      const row = [
        escapeCsv(event.id),
        format(new Date(event.receivedAt), 'yyyy-MM-dd HH:mm:ss'),
        escapeCsv(event.eventName),
        escapeCsv(event.pageUrl),
        escapeCsv(event.pageTitle),
        escapeCsv(event.visitorsId),
        escapeCsv(event.sessionId),
        escapeCsv(event.device || 'Unknown'),
        escapeCsv(event.browser || 'Unknown'),
        escapeCsv(event.os || 'Unknown')
      ];
      csvRows.push(row.join(','));
    });

    const csv = csvRows.join('\n');

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="analytics-export-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.csv"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0'
      }
    });
  } catch (error) {
    console.error('Export API Error:', error);

    return new NextResponse(
      `Error exporting data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      {
        status: 500,
        headers: { 'Content-Type': 'text/plain' }
      }
    );
  }
}
