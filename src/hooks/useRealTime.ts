import { useEffect, useRef, useState } from 'react';

export type SSEMessageType = 'connected' | 'new_event' | 'stats_update' | 'ping' | 'shutdown';

export interface SSEMessage<T = unknown> {
  type: SSEMessageType;
  timestamp: string;
  payload?: T;
}

export interface NewEventPayload {
  id: string;
  eventName: string;
  pageUrl: string | null;
  pageTitle: string | null;
  device: string;
  browser: string | null;
  os: string | null;
  visitorsId: string | null;
  sessionId: string | null;
  receivedAt: Date;
  clientTimestamp: Date | null;
}

export interface StatsUpdatePayload {
  totalEvents: number;
  uniqueVisitors: number;
  activeSessions: number;
}

interface UseRealtimeEventsOptions {
  orgId: string;
  enabled?: boolean;
  onNewEvent?: (event: NewEventPayload) => void;
  onStatsUpdate?: (stats: StatsUpdatePayload) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onError?: (error: Event) => void;
}

interface UseRealtimeEventsReturn {
  isConnected: boolean;
  connectionError: string | null;
  lastMessageAt: Date | null;
}

export function useRealtimeEvents(options: UseRealtimeEventsOptions): UseRealtimeEventsReturn {
  const {
    orgId,
    enabled = true,
    onNewEvent,
    onStatsUpdate,
    onConnected,
    onDisconnected,
    onError
  } = options;
  console.log('[SSE Hook] Hook called with:', { orgId, enabled });
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [lastMessageAt, setLastMessageAt] = useState<Date | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);

  const callbacksRef = useRef({
    onNewEvent,
    onStatsUpdate,
    onConnected,
    onDisconnected,
    onError
  });

  useEffect(() => {
    callbacksRef.current = {
      onNewEvent,
      onStatsUpdate,
      onConnected,
      onDisconnected,
      onError
    };
  }, [onNewEvent, onStatsUpdate, onConnected, onDisconnected, onError]);

  useEffect(() => {

    if (!enabled) {
      return;
    }
    if (!orgId) {
      return;
    }
    console.log('[SSE Hook] Creating EventSource connection...');
    const url = `/api/realtime/events?orgId=${encodeURIComponent(orgId)}`;
    let eventSource: EventSource;

    try {
      eventSource = new EventSource(url);

      eventSourceRef.current = eventSource;

      eventSource.onopen = (event) => {
        setIsConnected(true);
        setConnectionError(null);
      };

      eventSource.onmessage = (event) => {

        try {
          const message: SSEMessage = JSON.parse(event.data);

          setLastMessageAt(new Date());

          switch (message.type) {
            case 'connected':
              callbacksRef.current.onConnected?.();
              break;

            case 'new_event':
              if (callbacksRef.current.onNewEvent && message.payload) {
                callbacksRef.current.onNewEvent(message.payload as NewEventPayload);
              }
              break;

            case 'stats_update':
              if (callbacksRef.current.onStatsUpdate && message.payload) {
                callbacksRef.current.onStatsUpdate(message.payload as StatsUpdatePayload);
              }
              break;

            case 'ping':
              break;

            case 'shutdown':
              break;

            default:
              console.warn('[SSE Hook] Unknown message type:', message.type);
          }
        } catch (error) {
          console.error('[SSE Hook] Failed to parse message:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('[SSE Hook] Connection error:', error);
        console.log('[SSE Hook] ReadyState on error:', eventSource.readyState);

        setIsConnected(false);
        setConnectionError('Connection lost. Reconnecting...');
        callbacksRef.current.onDisconnected?.();
        callbacksRef.current.onError?.(error);
      };
    } catch (error) {
      console.error('[SSE Hook] Error creating EventSource:', error);
    }

    return () => {
      if (eventSourceRef.current) {
        console.log(
          '[SSE Hook] Closing EventSource, readyState:',
          eventSourceRef.current.readyState
        );
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      setIsConnected(false);
    };
  }, [orgId, enabled]);
  return {
    isConnected,
    connectionError,
    lastMessageAt
  };
}
