import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { user } from '@/src/lib/user';

export async function GET(req: NextRequest) {
  try {
    const session = await user()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const orgSlug = searchParams.get('orgId');
    console.log('orgSlug, and Search Parmas ::', orgSlug, searchParams)
    if (!orgSlug) {
      return new Response('Missing orgId', { status: 400 });
    }
    const org = await prisma.membership.findFirst({
      where: { userId: session?.user.id },
      include: { org: true }
    });
    const orgId = org?.orgId;

    const member = await prisma.membership.findFirst({
      where: { userId: session.user.id, orgId },
    });

    if (!member) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const last7Days = new Date(today);
    last7Days.setDate(last7Days.getDate() - 7);
    const last30Days = new Date(today);
    last30Days.setDate(last30Days.getDate() - 30);

    // Parallel data fetching
    const [
      totalEvents,
      totalEventsYesterday,
      uniqueVisitors,
      uniqueVisitorsYesterday,
      pageViews,
      pageViewsYesterday,
      activeSessions,
      eventsLast7Days,
      topPages,
      deviceDistribution,
      browserDistribution,
      recentEvents,
    ] = await Promise.all([
      prisma.event.count({
        where: { orgId, receivedAt: { gte: today } },
      }),

      prisma.event.count({
        where: {
          orgId,
          receivedAt: { gte: yesterday, lt: today },
        },
      }),

      // Unique visitors today
      prisma.event.groupBy({
        by: ['visitorsId'],
        where: {
          orgId,
          visitorsId: { not: null },
          receivedAt: { gte: today },
        },
      }),

      // Unique visitors yesterday
      prisma.event.groupBy({
        by: ['visitorsId'],
        where: {
          orgId,
          visitorsId: { not: null },
          receivedAt: { gte: yesterday, lt: today },
        },
      }),

      // Page views today
      prisma.event.count({
        where: {
          orgId,
          eventName: 'pageview',
          receivedAt: { gte: today },
        },
      }),

      // Page views yesterday
      prisma.event.count({
        where: {
          orgId,
          eventName: 'pageview',
          receivedAt: { gte: yesterday, lt: today },
        },
      }),

      // Active sessions (last 30 min)
      prisma.event.groupBy({
        by: ['sessionId'],
        where: {
          orgId,
          sessionId: { not: null },
          receivedAt: { gte: new Date(Date.now() - 30 * 60 * 1000) },
        },
      }),

      // Events over last 7 days (grouped by day) using Prisma + JS aggregation
      prisma.event
        .findMany({
          where: { orgId, receivedAt: { gte: last7Days } },
          select: { receivedAt: true },
        })
        .then((events) => {
          const counts: Record<string, number> = {};
          events.forEach((e) => {
            const date = e.receivedAt.toISOString().slice(0, 10); // YYYY-MM-DD
            counts[date] = (counts[date] || 0) + 1;
          });
          return Object.keys(counts)
            .sort()
            .map((date) => ({ date, count: counts[date] }));
        }),

      // Top 10 pages
      prisma.event.groupBy({
        by: ['pageUrl'],
        where: {
          orgId,
          pageUrl: { not: null },
          receivedAt: { gte: last7Days },
        },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      }),

      // Device distribution
      prisma.event.groupBy({
        by: ['device'],
        where: { orgId, receivedAt: { gte: last7Days } },
        _count: { id: true },
      }),

      // Browser distribution
      prisma.event.groupBy({
        by: ['browser'],
        where: {
          orgId,
          browser: { not: null },
          receivedAt: { gte: last7Days },
        },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 5,
      }),

      // Recent 10 events
      prisma.event.findMany({
        where: { orgId },
        orderBy: { receivedAt: 'desc' },
        take: 10,
        select: {
          id: true,
          eventName: true,
          pageUrl: true,
          pageTitle: true,
          receivedAt: true,
          device: true,
        },
      }),
    ]);

    const calculateTrend = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const uniqueVisitorsCount = uniqueVisitors.length;
    const uniqueVisitorsYesterdayCount = uniqueVisitorsYesterday.length;

    const stats = {
      totalEvents: {
        value: totalEvents,
        trend: calculateTrend(totalEvents, totalEventsYesterday),
      },
      uniqueVisitors: {
        value: uniqueVisitorsCount,
        trend: calculateTrend(uniqueVisitorsCount, uniqueVisitorsYesterdayCount),
      },
      pageViews: {
        value: pageViews,
        trend: calculateTrend(pageViews, pageViewsYesterday),
      },
      activeSessions: {
        value: activeSessions.length,
        trend: 0,
      },
    };

    const eventsOverTime = (eventsLast7Days as any[]).map((item: any) => ({
      date: new Date(item.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      count: Number(item.count),
    }));

    // Format top pages
    const topPagesFormatted = topPages.map((page) => ({
      url: page.pageUrl || 'Unknown',
      count: page._count.id,
    }));

    // Format device distribution
    const deviceDistributionFormatted = deviceDistribution.map((device) => ({
      name: device.device,
      value: device._count.id,
    }));

    // Format browser distribution
    const browserDistributionFormatted = browserDistribution.map((browser) => ({
      name: browser.browser || 'Unknown',
      count: browser._count.id,
    }));

    return NextResponse.json({
      stats,
      charts: {
        eventsOverTime,
        topPages: topPagesFormatted,
        deviceDistribution: deviceDistributionFormatted,
        browserDistribution: browserDistributionFormatted,
      },
      recentEvents,
    });
  } catch (error) {
    console.error('[Dashboard Stats API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';