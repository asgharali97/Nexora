type SendMessageFn = (message: string) => void;

interface Connection {
  send: SendMessageFn;
  encoder: TextEncoder;
  connectedAt: Date;
  lastActivity: Date;
  connectionId: string;
}

interface SSEMessage {
  type: string;
  timestamp: string;
  payload?: unknown;
}

const connections = new Map<string, Set<Connection>>();

export function addConnection(
  orgId: string,
  sendFn: SendMessageFn,
  encoder: TextEncoder
): string {
  if (!connections.has(orgId)) {
    connections.set(orgId, new Set());
  }

  const connectionId = `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const connection: Connection = {
    send: sendFn,
    encoder,
    connectedAt: new Date(),
    lastActivity: new Date(),
    connectionId,
  };

  connections.get(orgId)!.add(connection);

  console.log(`[SSE] Connection added: ${connectionId} for org: ${orgId}`);
  logConnectionStats();

  return connectionId;
}

export function removeConnection(orgId: string, connectionId: string): void {
  const orgConnections = connections.get(orgId);
  if (!orgConnections) return;

  for (const conn of orgConnections) {
    if (conn.connectionId === connectionId) {
      orgConnections.delete(conn);
      console.log(`[SSE] Connection removed: ${connectionId} from org: ${orgId}`);
      break;
    }
  }

  if (orgConnections.size === 0) {
    connections.delete(orgId);
    console.log(`[SSE] No more connections for org: ${orgId}, removed from registry`);
  }

  logConnectionStats();
}

export function broadcast(orgId: string, message: SSEMessage): void {
  const orgConnections = connections.get(orgId);

  console.log('[SSE] Broadcast called for org:', orgId);
  console.log('[SSE] Connections for this org:', orgConnections?.size || 0);

  if (!orgConnections || orgConnections.size === 0) {
    console.log(`[SSE] No connections found for org: ${orgId}`);
    return;
  }

  const messageStr = `data: ${JSON.stringify(message)}\n\n`;

  let successCount = 0;
  let failureCount = 0;

  orgConnections.forEach((conn) => {
    try {
      conn.send(messageStr);
      conn.lastActivity = new Date();
      successCount++;
    } catch (error) {
      console.error(`[SSE] Failed to send to connection ${conn.connectionId}:`, error);
      failureCount++;
    }
  });

  console.log(
    `[SSE] Broadcast complete: ${successCount} succeeded, ${failureCount} failed`
  );
}

export function sendKeepAlivePing(): void {
  const pingMessage: SSEMessage = {
    type: 'ping',
    timestamp: new Date().toISOString(),
  };

  const messageStr = `data: ${JSON.stringify(pingMessage)}\n\n`;
  let totalSent = 0;
  let totalFailed = 0;

  connections.forEach((orgConnections) => {
    orgConnections.forEach((conn) => {
      try {
        conn.send(messageStr);
        conn.lastActivity = new Date();
        totalSent++;
      } catch (error) {
        totalFailed++;
      }
    });
  });

  if (totalSent > 0 || totalFailed > 0) {
    console.log(`[SSE] Keep-alive ping: ${totalSent} sent, ${totalFailed} failed`);
  }
}

export function cleanupStaleConnections(timeoutMs: number = 5 * 60 * 1000): void {
  const now = Date.now();
  let cleanedCount = 0;

  connections.forEach((orgConnections, orgId) => {
    const toRemove: Connection[] = [];

    orgConnections.forEach((conn) => {
      if (now - conn.lastActivity.getTime() > timeoutMs) {
        toRemove.push(conn);
      }
    });

    toRemove.forEach((conn) => {
      orgConnections.delete(conn);
      cleanedCount++;
      console.log(`[SSE] Cleaned up stale connection: ${conn.connectionId}`);
    });

    if (orgConnections.size === 0) {
      connections.delete(orgId);
    }
  });

  if (cleanedCount > 0) {
    console.log(`[SSE] Cleanup complete: ${cleanedCount} stale connections removed`);
    logConnectionStats();
  }
}

export function getConnectionStats(): {
  totalOrgs: number;
  totalConnections: number;
  connectionsByOrg: Record<string, number>;
} {
  const stats = {
    totalOrgs: connections.size,
    totalConnections: 0,
    connectionsByOrg: {} as Record<string, number>,
  };

  connections.forEach((orgConnections, orgId) => {
    const count = orgConnections.size;
    stats.totalConnections += count;
    stats.connectionsByOrg[orgId] = count;
  });

  return stats;
}

function logConnectionStats(): void {
  const stats = getConnectionStats();
  console.log(
    `[SSE] Active connections: ${stats.totalConnections} across ${stats.totalOrgs} organizations`
  );
}

export function initializeRealtimeEvents(): void {
  console.log('[SSE] Initializing real-time events module');

  setInterval(() => {
    sendKeepAlivePing();
  }, 30 * 1000);

  setInterval(() => {
    cleanupStaleConnections();
  }, 60 * 1000);

  console.log('[SSE] Real-time events module initialized');
}

export function shutdownRealtimeEvents(): void {
  console.log('[SSE] Shutting down real-time events module');

  const shutdownMessage: SSEMessage = {
    type: 'shutdown',
    timestamp: new Date().toISOString(),
  };

  const messageStr = `data: ${JSON.stringify(shutdownMessage)}\n\n`;

  connections.forEach((orgConnections) => {
    orgConnections.forEach((conn) => {
      try {
        conn.send(messageStr);
      } catch {}
    });
  });

  connections.clear();

  console.log('[SSE] Real-time events module shutdown complete');
}