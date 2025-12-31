import { initializeRealtimeEvents } from './realtimeEvent';

let initialized = false;

export function ensureRealtimeInitialized() {
  if (!initialized) {
    console.log('[Realtime] Initializing module');
    initializeRealtimeEvents();
    initialized = true;
  }
}