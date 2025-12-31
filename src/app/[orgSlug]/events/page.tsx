'use client';
import { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  useRealtimeEvents, 
  type NewEventPayload,
  type StatsUpdatePayload,
} from '@/src/hooks/useRealTime';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { Switch } from '@/src/components/ui/switch';
import { Label } from '@/src/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/components/ui/table';

export default function RealtimeAnalyticsPage() {
  const params = useParams();
  const orgId = params.orgSlug as string;

  const [events, setEvents] = useState<NewEventPayload[]>([]);
  const [autoScroll, setAutoScroll] = useState(true);
  const tableRef = useRef<HTMLDivElement>(null);

  const [stats, setStats] = useState<StatsUpdatePayload>({
    totalEvents: 0,
    uniqueVisitors: 0,
    activeSessions: 0,
  });

  const { isConnected, connectionError, lastMessageAt } = useRealtimeEvents({
    orgId,
    onNewEvent: (event) => {
      setEvents((prev) => [event, ...prev].slice(0, 100));
      
      setStats((prev) => ({
        ...prev,
        totalEvents: prev.totalEvents,
      }));
    },
    onStatsUpdate: (newStats) => {
      setStats(newStats);
    },
    onConnected: () => {
      console.log('Real-time connection established');
    },
    onDisconnected: () => {
      console.log('Real-time connection lost');
    },
  });

  useEffect(() => {
    if (autoScroll && tableRef.current) {
      tableRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [events, autoScroll]);

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getTimeSinceLastUpdate = () => {
    if (!lastMessageAt) return null;
    
    const seconds = Math.floor((Date.now() - lastMessageAt.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  const getConnectionStatusColor = () => {
    if (!isConnected) return 'bg-red-500';
    if (!lastMessageAt) return 'bg-yellow-500';
    
    const seconds = Math.floor((Date.now() - lastMessageAt.getTime()) / 1000);
    if (seconds > 60) return 'bg-yellow-500';
    
    return 'bg-green-500';
  };

  const clearEvents = () => {
    setEvents([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Real-Time Analytics</h1>
          <p className="text-muted-foreground">
            Live event stream for your organization
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div
              className={`h-3 w-3 rounded-full ${getConnectionStatusColor()} ${
                isConnected ? 'animate-pulse' : ''
              }`}
            />
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {isConnected ? 'Live' : connectionError || 'Connecting...'}
              </span>
              {lastMessageAt && (
                <span className="text-xs text-muted-foreground">
                  {getTimeSinceLastUpdate()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              All-time event count
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueVisitors.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Individual users tracked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSessions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Live Event Stream</CardTitle>
              <p className="text-sm text-muted-foreground">
                Showing {events.length} most recent events
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-scroll"
                  checked={autoScroll}
                  onCheckedChange={setAutoScroll}
                />
                <Label htmlFor="auto-scroll" className="text-sm">
                  Auto-scroll
                </Label>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={clearEvents}
                disabled={events.length === 0}
              >
                Clear Events
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              {isConnected ? 'Waiting for events...' : 'Connecting to live stream...'}
            </div>
          ) : (
            <div ref={tableRef} className="max-h-[600px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Page</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>Browser</TableHead>
                    <TableHead>Visitor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-mono text-xs">
                        {formatTime(event.receivedAt)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{event.eventName}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {event.pageTitle || event.pageUrl || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{event.device}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {event.browser || '-'}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {event.visitorsId?.substring(0, 8) || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}