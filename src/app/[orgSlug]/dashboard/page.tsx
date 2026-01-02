'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import {
  ArrowUpIcon,
  ArrowDownIcon,
  TrendingUpIcon,
  UsersIcon,
  EyeIcon,
  ActivityIcon
} from 'lucide-react';
import { RoundedPieChart } from '@/src/components/charts/roundedPieChart';
import { ClipAreaChart } from '@/src/components/charts/clippedAreaChart';
import { MonochromeBarChart } from '@/src/components/charts/MonochromeBarChart';

interface DashboardStats {
  totalEvents: { value: number; trend: number };
  uniqueVisitors: { value: number; trend: number };
  pageViews: { value: number; trend: number };
  activeSessions: { value: number; trend: number };
}

interface ChartData {
  eventsOverTime: { date: string; count: number }[];
  topPages: { url: string; count: number }[];
  deviceDistribution: { name: string; value: number }[];
  browserDistribution: { name: string; count: number }[];
}

interface RecentEvent {
  id: string;
  eventName: string;
  pageUrl: string | null;
  pageTitle: string | null;
  receivedAt: Date;
  device: string;
}

interface DashboardData {
  stats: DashboardStats;
  charts: ChartData;
  recentEvents: RecentEvent[];
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

export default function DashboardPage() {
  const params = useParams();
  const orgId = params.orgSlug as string;

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, [orgId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/dashboard/stats?orgId=${orgId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="border-primary mx-auto h-12 w-12 animate-spin rounded-full border-b-2"></div>
          <p className="text-muted-foreground mt-4">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">{error || 'Failed to load dashboard'}</p>
          <Button onClick={fetchDashboardData} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const { stats, charts, recentEvents } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your analytics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/${orgId}/analytics`}>View Analytics</Link>
          </Button>
          <Button asChild>
            <Link href={`/${orgId}/events`}>Live Events</Link>
          </Button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <ActivityIcon className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.totalEvents.value)}</div>
            <div className="text-muted-foreground mt-1 flex items-center text-xs">
              {stats.totalEvents.trend > 0 ? (
                <ArrowUpIcon className="mr-1 h-3 w-3 text-green-500" />
              ) : stats.totalEvents.trend < 0 ? (
                <ArrowDownIcon className="mr-1 h-3 w-3 text-red-500" />
              ) : null}
              <span
                className={
                  stats.totalEvents.trend > 0
                    ? 'text-green-500'
                    : stats.totalEvents.trend < 0
                      ? 'text-red-500'
                      : ''
                }
              >
                {stats.totalEvents.trend > 0 ? '+' : ''}
                {stats.totalEvents.trend}%
              </span>
              <span className="ml-1">vs yesterday</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
            <UsersIcon className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.uniqueVisitors.value)}</div>
            <div className="text-muted-foreground mt-1 flex items-center text-xs">
              {stats.uniqueVisitors.trend > 0 ? (
                <ArrowUpIcon className="mr-1 h-3 w-3 text-green-500" />
              ) : stats.uniqueVisitors.trend < 0 ? (
                <ArrowDownIcon className="mr-1 h-3 w-3 text-red-500" />
              ) : null}
              <span
                className={
                  stats.uniqueVisitors.trend > 0
                    ? 'text-green-500'
                    : stats.uniqueVisitors.trend < 0
                      ? 'text-red-500'
                      : ''
                }
              >
                {stats.uniqueVisitors.trend > 0 ? '+' : ''}
                {stats.uniqueVisitors.trend}%
              </span>
              <span className="ml-1">vs yesterday</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Page Views</CardTitle>
            <EyeIcon className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.pageViews.value)}</div>
            <div className="text-muted-foreground mt-1 flex items-center text-xs">
              {stats.pageViews.trend > 0 ? (
                <ArrowUpIcon className="mr-1 h-3 w-3 text-green-500" />
              ) : stats.pageViews.trend < 0 ? (
                <ArrowDownIcon className="mr-1 h-3 w-3 text-red-500" />
              ) : null}
              <span
                className={
                  stats.pageViews.trend > 0
                    ? 'text-green-500'
                    : stats.pageViews.trend < 0
                      ? 'text-red-500'
                      : ''
                }
              >
                {stats.pageViews.trend > 0 ? '+' : ''}
                {stats.pageViews.trend}%
              </span>
              <span className="ml-1">vs yesterday</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Now</CardTitle>
            <TrendingUpIcon className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.activeSessions.value)}</div>
            <p className="text-muted-foreground mt-1 text-xs">Sessions in last 30 min</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4">
        <ClipAreaChart
          title="Events Over Time"
          description="Last 7 days"
          data={charts.eventsOverTime}
          xAxisKey="date"
          yAxisKey="count"
          showTrend={true}
          trendValue={15}
          trendLabel="vs previous week"
          color="#3b82f6"
          height={300}
          showAnimation={true}
          showGrid={true}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <RoundedPieChart
          title="Device Distribution"
          description="Last 7 Days"
          data={charts.deviceDistribution}
          dataKey="value"
          nameKey="name"
        />
        <RoundedPieChart
          title="Browser Distribution"
          description="Top browsers"
          data={charts.browserDistribution.map((b) => ({ name: b.name, value: b.count }))}
          dataKey="value"
          nameKey="name"
          showTrend={true}
          trendValue={8}
          trendLabel="vs last week"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <MonochromeBarChart
          title="Top Pages"
          description="Most visited pages"
          data={charts.topPages}
          xAxisKey="url"
          yAxisKey="count"
          orientation="vertical"
          height={300}
          yAxisWidth={150}
          showTooltip={true}
        />
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Events</CardTitle>
              <p className="text-muted-foreground text-sm">Latest activity</p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/${orgId}/events`}>View All</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentEvents.map((event) => (
              <div
                key={event.id}
                className="hover:bg-muted/50 flex items-center justify-between rounded-lg border p-3 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">{event.eventName}</Badge>
                  <div>
                    <p className="text-sm font-medium">
                      {event.pageTitle || event.pageUrl || 'Unknown Page'}
                    </p>
                    <p className="text-muted-foreground text-xs">{event.device}</p>
                  </div>
                </div>
                <span className="text-muted-foreground text-xs">
                  {formatTime(event.receivedAt)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
