'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import {
  useRealtimeEvents,
  type NewEventPayload,
  type StatsUpdatePayload
} from '@/src/hooks/useRealTime';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/src/components/ui/table';

export default function RealtimeAnalyticsPage() {
  const params = useParams();
  console.log(params)
  const orgId  = params.orgSlug as string;
  console.log(orgId)

  const [events, setEvents] = useState<NewEventPayload[]>([]);
  const [stats, setStats] = useState<StatsUpdatePayload>({
    totalEvents: 0,
    uniqueVisitors: 0,
    activeSessions: 0
  });
  console.log('[Events Page] Rendering with orgId:', orgId);
  const { isConnected, connectionError, lastMessageAt } = useRealtimeEvents({
    orgId,
    onNewEvent: (event) => {
      setEvents((prev) => [event, ...prev].slice(0, 100));

      setStats((prev) => ({
        ...prev,
        totalEvents: prev.totalEvents + 1
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
    }
  });
  console.log('stats ', stats)
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Real-Time Analytics</h1>
          <p className="text-muted-foreground">Live event stream for your organization</p>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={`h-3 w-3 rounded-full ${
              isConnected ? 'animate-pulse bg-green-500' : 'bg-gray-400'
            }`}
          />
          <span className="text-sm font-medium">
            {isConnected ? 'Live' : connectionError || 'Connecting...'}
          </span>
          {lastMessageAt && (
            <span className="text-muted-foreground ml-2 text-xs">
              Last update: {formatTime(lastMessageAt)}
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents.toLocaleString()}</div>
            <p className="text-muted-foreground text-xs">All-time event count</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueVisitors.toLocaleString()}</div>
            <p className="text-muted-foreground text-xs">Individual users tracked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSessions.toLocaleString()}</div>
            <p className="text-muted-foreground text-xs">Currently active</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Live Event Stream</CardTitle>
          <p className="text-muted-foreground text-sm">
            Showing {events.length} most recent events
          </p>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-muted-foreground flex items-center justify-center py-8">
              Waiting for events...
            </div>
          ) : (
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
                    <TableCell className="text-muted-foreground text-sm">
                      {event.browser || '-'}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {event.visitorsId?.substring(0, 8) || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
