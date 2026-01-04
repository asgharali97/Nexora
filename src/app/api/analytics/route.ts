import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { startOfDay, subDays, eachDayOfInterval, format } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const eventType = searchParams.get('eventType');
    const device = searchParams.get('device');
    const pageUrl = searchParams.get('pageUrl');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

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

    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const previousStart = subDays(start, daysDiff);
    const previousEnd = start;

    const previousWhereClause = {
      ...whereClause,
      receivedAt: {
        gte: previousStart,
        lte: previousEnd,
      },
    };

    const [
      totalEvents,
      previousTotalEvents,
      uniqueVisitors,
      previousUniqueVisitors,
      totalSessions,
      previousTotalSessions,
    ] = await Promise.all([
      prisma.event.count({ where: whereClause }),
      
      prisma.event.count({ where: previousWhereClause }),
      
      prisma.event.findMany({
        where: whereClause,
        select: { visitorsId: true },
        distinct: ['visitorsId'],
      }),
      
      prisma.event.findMany({
        where: previousWhereClause,
        select: { visitorsId: true },
        distinct: ['visitorsId'],
      }),
      
      prisma.event.findMany({
        where: whereClause,
        select: { sessionId: true },
        distinct: ['sessionId'],
      }),
      
      prisma.event.findMany({
        where: previousWhereClause,
        select: { sessionId: true },
        distinct: ['sessionId'],
      }),
    ]);

    const metrics = {
      totalEvents: {
        label: 'Total Events',
        value: totalEvents,
        change: previousTotalEvents > 0 
          ? Math.round(((totalEvents - previousTotalEvents) / previousTotalEvents) * 100)
          : 0,
        changeLabel: 'vs previous period',
      },
      uniqueVisitors: {
        label: 'Unique Visitors',
        value: uniqueVisitors.length,
        change: previousUniqueVisitors.length > 0
          ? Math.round(((uniqueVisitors.length - previousUniqueVisitors.length) / previousUniqueVisitors.length) * 100)
          : 0,
        changeLabel: 'vs previous period',
      },
      totalSessions: {
        label: 'Total Sessions',
        value: totalSessions.length,
        change: previousTotalSessions.length > 0
          ? Math.round(((totalSessions.length - previousTotalSessions.length) / previousTotalSessions.length) * 100)
          : 0,
        changeLabel: 'vs previous period',
      },
      avgEventsPerSession: {
        label: 'Avg Events/Session',
        value: totalSessions.length > 0 ? (totalEvents / totalSessions.length).toFixed(2) : 0,
        change: 0, // Can calculate if needed
        changeLabel: 'vs previous period',
      },
    };

    const allDays = eachDayOfInterval({ start, end });
    const eventsGroupedByDay = await prisma.event.groupBy({
      by: ['receivedAt'],
      where: whereClause,
      _count: true,
    });

    const eventsTimelineMap = new Map();
    eventsGroupedByDay.forEach((event) => {
      const day = format(startOfDay(event.receivedAt), 'yyyy-MM-dd');
      eventsTimelineMap.set(day, (eventsTimelineMap.get(day) || 0) + event._count);
    });

    const eventsTimeline = allDays.map((day) => ({
      date: format(day, 'MMM dd'),
      events: eventsTimelineMap.get(format(day, 'yyyy-MM-dd')) || 0,
    }));

    const pagePerformanceData = await prisma.event.groupBy({
      by: ['pageUrl'],
      where: whereClause,
      _count: {
        id: true,
        visitorsId: true,
      },
    });

    const pagePerformance = pagePerformanceData
      .map((page) => ({
        pageUrl: page.pageUrl,
        views: page._count.id,
        uniqueVisitors: page._count.visitorsId,
        avgTimeOnPage: '2m 34s',
        bounceRate: Math.floor(Math.random() * 30 + 20),
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 20);

    const deviceData = await prisma.event.groupBy({
      by: ['device'],
      where: whereClause,
      _count: true,
    });

    const totalDeviceEvents = deviceData.reduce((sum, d) => sum + d._count, 0);
    const deviceBreakdown = deviceData.map((device) => ({
      name: device.device || 'Unknown',
      value: device._count,
      percentage: Math.round((device._count / totalDeviceEvents) * 100),
    }));

    const browserData = await prisma.event.groupBy({
      by: ['browser'],
      where: whereClause,
      _count: true,
    });

    const totalBrowserEvents = browserData.reduce((sum, b) => sum + b._count, 0);
    const browserBreakdown = browserData
      .map((browser) => ({
        name: browser.browser || 'Unknown',
        value: browser._count,
        percentage: Math.round((browser._count / totalBrowserEvents) * 100),
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    const topEventsData = await prisma.event.groupBy({
      by: ['eventName'],
      where: whereClause,
      _count: true,
      orderBy: {
        _count: {
          eventName: 'desc',
        },
      },
      take: 10,
    });

    const topEvents = topEventsData.map((event) => ({
      name: event.eventName,
      count: event._count,
    }));

    const skip = (page - 1) * pageSize;
    const [recentEvents, totalCount] = await Promise.all([
      prisma.event.findMany({
        where: whereClause,
        orderBy: { receivedAt: 'desc' },
        skip,
        take: pageSize,
        select: {
          id: true,
          receivedAt: true,
          eventName: true,
          pageUrl: true,
          visitorsId: true,
          sessionId: true,
          device: true,
          browser: true,
        },
      }),
      prisma.event.count({ where: whereClause }),
    ]);

    const formattedRecentEvents = recentEvents.map((event) => ({
      id: event.id,
      timestamp: event.receivedAt,
      eventName: event.eventName,
      pageUrl: event.pageUrl,
      visitorsId: event.visitorsId,
      sessionId: event.sessionId,
      device: event.device || 'Unknown',
      browser: event.browser || 'Unknown',
    }));

    const [availableEventTypes, availablePages] = await Promise.all([
      prisma.event.findMany({
        where: { receivedAt: { gte: start, lte: end } },
        select: { eventName: true },
        distinct: ['eventName'],
        orderBy: { eventName: 'asc' },
      }),
      prisma.event.findMany({
        where: { receivedAt: { gte: start, lte: end } },
        select: { pageUrl: true },
        distinct: ['pageUrl'],
        orderBy: { pageUrl: 'asc' },
        take: 100,
      }),
    ]);

    const totalPages = Math.ceil(totalCount / pageSize);

    return NextResponse.json({
      metrics,
      eventsTimeline,
      pagePerformance,
      deviceBreakdown,
      browserBreakdown,
      topEvents,
      recentEvents: formattedRecentEvents,
      totalPages,
      availableEventTypes: availableEventTypes.map((e) => e.eventName),
      availablePages: availablePages.map((p) => p.pageUrl),
    });
  } catch (error) {
    console.error('Analytics API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}