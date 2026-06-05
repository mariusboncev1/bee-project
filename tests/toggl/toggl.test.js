import { describe, it, expect } from 'vitest';

describe('Toggl Service', () => {
  it('should export Toggl functions', async () => {
    const togglService = await import('../../src/services/togglService.js');
    expect(togglService.startTimeEntry).toBeDefined();
    expect(togglService.stopTimeEntry).toBeDefined();
    expect(togglService.getTimeEntries).toBeDefined();
  });

  it('should handle missing API token gracefully', async () => {
    const { startTimeEntry } = await import('../../src/services/togglService.js');
    const result = await startTimeEntry('Test task');
    expect(result).toBeDefined();
    expect(result.mock).toBe(true);
  });

  it('should return mock response when not configured', async () => {
    const { getTimeEntries } = await import('../../src/services/togglService.js');
    const entries = await getTimeEntries('2024-01-01', '2024-01-31');
    expect(Array.isArray(entries)).toBe(true);
  });
});
