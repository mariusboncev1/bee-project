import { describe, it, expect } from 'vitest';

describe('Community Service', () => {
  it('should export community functions', async () => {
    const communityService = await import('../../src/services/communityService.js');
    expect(communityService.findNearbyBeekeepers).toBeDefined();
    expect(communityService.getAllCommunityMembers).toBeDefined();
    expect(communityService.getUserApiariesForMap).toBeDefined();
    expect(communityService.calculateDistance).toBeDefined();
  });

  it('should calculate distance between coordinates', async () => {
    const { calculateDistance } = await import('../../src/services/communityService.js');
    
    // Cluj-Napoca to Bucharest (approx 320-340 km)
    const distance = calculateDistance(46.7712, 23.6236, 44.4268, 26.1025);
    
    expect(distance).toBeGreaterThan(300);
    expect(distance).toBeLessThan(400);
  });

  it('should calculate zero distance for same coordinates', async () => {
    const { calculateDistance } = await import('../../src/services/communityService.js');
    
    const distance = calculateDistance(46.7712, 23.6236, 46.7712, 23.6236);
    
    expect(distance).toBe(0);
  });
});
