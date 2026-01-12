'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Download, RefreshCw, Filter, X } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/src/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Input } from '@/src/components/ui/input';
import { Skeleton } from '@/src/components/ui/skeleton';
import { ClipAreaChart } from '@/src/components/charts/clippedAreaChart';
import { RoundedPieChart } from '@/src/components/charts/roundedPieChart';
import { DefaultBarChart } from '@/src/components/charts/DefaultBarChart';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from '@/src/components/ui/table';

interface AnalyticsFilters {
  dateRange: string;
  startDate?: Date;
  endDate?: Date;
  eventType: string;
  device: string;
  pageUrl: string;
}

interface MetricCard {
  label: string;
  value: string | number;
  change: number;
  changeLabel: string;
}

interface PagePerformance {
  pageUrl: string;
  views: number;
  uniqueVisitors: number;
  avgTimeOnPage: string;
  bounceRate: number;
}

interface EventRow {
  id: string;
  timestamp: Date;
  eventName: string;
  pageUrl: string;
  visitorsId: string;
  sessionId: string;
  device: string;
  browser: string;
}

interface AnalyticsData {
  metrics: {
    totalEvents: MetricCard;
    uniqueVisitors: MetricCard;
    totalSessions: MetricCard;
    avgEventsPerSession: MetricCard;
  };
  eventsTimeline: Array<{ date: string; events: number }>;
  pagePerformance: PagePerformance[];
  deviceBreakdown: Array<{ name: string; value: number; percentage: number }>;
  browserBreakdown: Array<{ name: string; value: number; percentage: number }>;
  topEvents: Array<{ name: string; count: number }>;
  recentEvents: EventRow[];
  totalPages: number;
  availableEventTypes: string[];
  availablePages: string[];
}

export default function AnalyticsPage() {
  const params = useParams();
  const orgSlug = params.orgSlug as string;

  const [filters, setFilters] = useState<AnalyticsFilters>({
    dateRange: 'last7days',
    eventType: 'all',
    device: 'all',
    pageUrl: ''
  });

  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);

  const dateRange = useMemo(() => {
    const end = endOfDay(new Date());
    let start: Date;

    switch (filters.dateRange) {
      case 'today':
        start = startOfDay(new Date());
        break;
      case 'yesterday':
        start = startOfDay(subDays(new Date(), 1));
        break;
      case 'last7days':
        start = startOfDay(subDays(new Date(), 7));
        break;
      case 'last30days':
        start = startOfDay(subDays(new Date(), 30));
        break;
      case 'last90days':
        start = startOfDay(subDays(new Date(), 90));
        break;
      default:
        start = filters.startDate || startOfDay(subDays(new Date(), 7));
    }

    return { start, end };
  }, [filters.dateRange, filters.startDate]);

  const fetchAnalytics = useCallback(
    async (pageUpdate = false) => {
      try {
        if (pageUpdate) {
          setTableLoading(true);
        } else {
          setLoading(true);
        }

        const queryParams = new URLSearchParams({
          startDate: dateRange.start.toISOString(),
          endDate: dateRange.end.toISOString(),
          page: currentPage.toString(),
          pageSize: pageSize.toString()
        });

        if (filters.eventType !== 'all') {
          queryParams.append('eventType', filters.eventType);
        }
        if (filters.device !== 'all') {
          queryParams.append('device', filters.device);
        }
        if (filters.pageUrl) {
          queryParams.append('pageUrl', filters.pageUrl);
        }

        const response = await fetch(`/api/analytics?${queryParams.toString()}`);

        if (!response.ok) throw new Error('Failed to fetch analytics');

        const analyticsData = await response.json();
        setData(analyticsData);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
        setTableLoading(false);
      }
    },
    [dateRange, currentPage, pageSize, filters]
  );

  useEffect(() => {
    setCurrentPage(1);
    fetchAnalytics(false);
  }, [filters, dateRange]);

  useEffect(() => {
    if (currentPage !== 1 && data) {
      fetchAnalytics(true);
    }
  }, [currentPage]);

  const activeFilters = useMemo(() => {
    const active = [];
    if (filters.eventType !== 'all')
      active.push({ key: 'eventType', label: `Event: ${filters.eventType}` });
    if (filters.device !== 'all')
      active.push({ key: 'device', label: `Device: ${filters.device}` });
    if (filters.pageUrl) active.push({ key: 'pageUrl', label: `Page: ${filters.pageUrl}` });
    return active;
  }, [filters]);

  const removeFilter = (key: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: key === 'pageUrl' ? '' : 'all'
    }));
  };

  const resetFilters = () => {
    setFilters({
      dateRange: 'last7days',
      eventType: 'all',
      device: 'all',
      pageUrl: ''
    });
    setCurrentPage(1);
  };

  const exportToCSV = async () => {
    try {
      const queryParams = new URLSearchParams({
        startDate: dateRange.start.toISOString(),
        endDate: dateRange.end.toISOString()
      });      

      if (filters.eventType !== 'all') {
        queryParams.append('eventType', filters.eventType);
      }
      if (filters.device !== 'all') {
        queryParams.append('device', filters.device);
      }
      if (filters.pageUrl) {
        queryParams.append('pageUrl', filters.pageUrl);
      }


      const response = await fetch(`/api/analytics/export?${queryParams.toString()}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Export failed:', errorText);
        return;
      }

      const contentType = response.headers.get('content-type');

      if (!contentType || !contentType.includes('text/csv')) {
        const text = await response.text();
        console.error('Expected CSV but got:', text.substring(0, 200));
        alert('Export failed: Invalid response format');
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.csv`;
      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);

    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Export failed. Check console for details.');
    }
  };

  const eventsTimelineData = useMemo(() => {
    if (!data?.eventsTimeline) return [];
    return data.eventsTimeline.map((item) => ({
      date: item.date,
      count: item.events
    }));
  }, [data?.eventsTimeline]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Deep dive into your data with advanced filtering and insights
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => fetchAnalytics(false)}
            size="sm"
            className="bg-secondary-light hover:bg-muted/50 shadow-s text-black"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button
            onClick={exportToCSV}
            size="sm"
            className="bg-secondary-light hover:bg-muted/50 shadow-s text-black"
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <Select
                value={filters.dateRange}
                onValueChange={(value) => setFilters({ ...filters, dateRange: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="last7days">Last 7 Days</SelectItem>
                  <SelectItem value="last30days">Last 30 Days</SelectItem>
                  <SelectItem value="last90days">Last 90 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Event Type</label>
              <Select
                value={filters.eventType}
                onValueChange={(value) => setFilters({ ...filters, eventType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  {data?.availableEventTypes.map((event) => (
                    <SelectItem key={event} value={event}>
                      {event}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Device</label>
              <Select
                value={filters.device}
                onValueChange={(value) => setFilters({ ...filters, device: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Devices</SelectItem>
                  <SelectItem value="desktop">Desktop</SelectItem>
                  <SelectItem value="mobile">Mobile</SelectItem>
                  <SelectItem value="tablet">Tablet</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Page URL</label>
              <Input
                placeholder="Search pages..."
                value={filters.pageUrl}
                onChange={(e) => setFilters({ ...filters, pageUrl: e.target.value })}
              />
            </div>
          </div>

          {activeFilters.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-4">
              <span className="text-sm font-medium">Active Filters:</span>
              {activeFilters.map((filter) => (
                <Badge
                  key={filter.key}
                  className="border-border shadow-in gap-1 border border-dashed bg-transparent text-black"
                >
                  {filter.label}
                  <button
                    onClick={() => removeFilter(filter.key)}
                    className="hover:bg-muted ml-1 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              <Button
                onClick={resetFilters}
                size="sm"
                className="bg-secondary-light hover:bg-muted/50 shadow-s text-black"
              >
                Reset All
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="mb-2 h-8 w-32" />
                <Skeleton className="h-4 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {data &&
            Object.entries(data.metrics).map(([key, metric]) => (
              <Card key={key}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-muted-foreground text-sm font-medium">
                    {metric.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metric.value.toLocaleString()}</div>
                  <p
                    className={`mt-1 text-xs ${metric.change >= 0 ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {metric.change >= 0 ? '↑' : '↓'} {Math.abs(metric.change)}% {metric.changeLabel}
                  </p>
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      <div className="grid gap-4">
        {loading ? (
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        ) : (
          <ClipAreaChart
            title="Events Over Time"
            description="Last 7 days"
            data={eventsTimelineData}
            xAxisKey="date"
            yAxisKey="count"
            showTrend={true}
            trendValue={15}
            trendLabel="vs previous week"
            color="#3b82f6"
            height={200}
            showAnimation={true}
            showGrid={true}
          />
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {loading ? (
          <>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[250px] w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[250px] w-full" />
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <div>
              <RoundedPieChart
                title="Device Distribution"
                description="Traffic by device type"
                data={data?.deviceBreakdown || []}
                height={300}
                dataKey="value"
                nameKey="name"
                showTrend={false}
              />
            </div>

            <div>
              <RoundedPieChart
                title="Browser Distribution"
                description="Traffic by browser"
                data={data?.browserBreakdown || []}
                height={300}
                dataKey="value"
                nameKey="name"
                showTrend={false}
              />
            </div>
          </>
        )}
      </div>

      {loading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[250px] w-full" />
          </CardContent>
        </Card>
      ) : (
        <DefaultBarChart
          title="Top Events"
          description="Most triggered events"
          data={data?.topEvents || []}
          xAxisKey="name"
          yAxisKey="count"
          showPattern={true}
          showTooltip={true}
        />
      )}

      {loading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Page Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Page URL</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Unique Visitors</TableHead>
                    <TableHead>Avg. Time</TableHead>
                    <TableHead>Bounce Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.pagePerformance.map((page, index) => (
                    <TableRow key={index}>
                      <TableCell>{page.pageUrl}</TableCell>
                      <TableCell>{page.views.toLocaleString()}</TableCell>
                      <TableCell>{page.uniqueVisitors.toLocaleString()}</TableCell>
                      <TableCell>{page.avgTimeOnPage}</TableCell>
                      <TableCell>{page.bounceRate}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Recent Events</CardTitle>
        </CardHeader>
        <CardContent>
          {tableLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Event Name</TableHead>
                      <TableHead>Page</TableHead>
                      <TableHead>Visitor ID</TableHead>
                      <TableHead>Device</TableHead>
                      <TableHead>Browser</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.recentEvents.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell>
                          {format(new Date(event.timestamp), 'MMM dd, HH:mm:ss')}
                        </TableCell>
                        <TableCell>
                          <Badge className="border-border shadow-in border border-dashed bg-transparent text-black">
                            {event.eventName}
                          </Badge>
                        </TableCell>
                        <TableCell>{event.pageUrl}</TableCell>
                        <TableCell>
                          {event.visitorsId ? event.visitorsId.slice(0, 8) : '-'}
                        </TableCell>
                        <TableCell>{event.device}</TableCell>
                        <TableCell>{event.browser}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {data && data.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-muted-foreground text-sm">
                    Page {currentPage} of {data.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1 || tableLoading}
                      size="sm"
                      className="bg-secondary-light hover:bg-muted/50 shadow-s text-black disabled:opacity-50"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setCurrentPage((p) => Math.min(data.totalPages, p + 1))}
                      disabled={currentPage === data.totalPages || tableLoading}
                      size="sm"
                      className="bg-secondary-light hover:bg-muted/50 shadow-s text-black disabled:opacity-50"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}