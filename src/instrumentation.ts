export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { initializeRealtimeEvents } = await import('@/src/lib/realtimeEvent');
    initializeRealtimeEvents();
  }
}