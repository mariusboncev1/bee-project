import { describe, it, expect } from 'vitest';

describe('Project Features - Quick Tests', () => {
  it('should have JWT auth middleware', async () => {
    const jwtAuth = await import('../src/middleware/jwtAuth.js');
    expect(jwtAuth.generateAccessToken).toBeDefined();
    expect(jwtAuth.generateRefreshToken).toBeDefined();
    expect(jwtAuth.authenticateToken).toBeDefined();
  });

  it('should have WebSocket handler', async () => {
    const socketHandler = await import('../src/websocket/socketHandler.js');
    expect(socketHandler.initializeWebSocket).toBeDefined();
    expect(socketHandler.getOnlineCount).toBeDefined();
  });

  it('should have Toggl service', async () => {
    const togglService = await import('../src/services/togglService.js');
    expect(togglService.startTimeEntry).toBeDefined();
    expect(togglService.stopTimeEntry).toBeDefined();
    expect(togglService.getTimeEntries).toBeDefined();
  });

  it('should handle Toggl with missing credentials', async () => {
    const { startTimeEntry } = await import('../src/services/togglService.js');
    const result = await startTimeEntry('Test task');
    expect(result.mock).toBe(true);
  });

  it('should return online count from WebSocket handler', async () => {
    const { getOnlineCount } = await import('../src/websocket/socketHandler.js');
    const count = getOnlineCount();
    expect(typeof count).toBe('number');
  });
});
