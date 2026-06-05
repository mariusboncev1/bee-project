import { describe, it, expect } from 'vitest';

describe('WebSocket Handler', () => {
  it('should export WebSocket functions', async () => {
    const socketHandler = await import('../../src/websocket/socketHandler.js');
    expect(socketHandler.initializeWebSocket).toBeDefined();
    expect(socketHandler.getOnlineCount).toBeDefined();
  });

  it('should have getOnlineCount return a number', async () => {
    const { getOnlineCount } = await import('../../src/websocket/socketHandler.js');
    const count = getOnlineCount();
    expect(typeof count).toBe('number');
    expect(count).toBeGreaterThanOrEqual(0);
  });
});
