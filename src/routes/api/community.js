const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middleware/jwtAuth');
const communityService = require('../../services/communityService');

/**
 * GET /api/community/nearby
 * Find beekeepers near a specific location
 * Query params: lat, lng, radius (optional, default 50km)
 */
router.get('/nearby', authenticateToken, async (req, res) => {
  const { lat, lng, radius } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ error: 'Latitude and longitude are required' });
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);
  const radiusKm = radius ? parseFloat(radius) : 50;

  if (isNaN(latitude) || isNaN(longitude)) {
    return res.status(400).json({ error: 'Invalid coordinates' });
  }

  try {
    const nearby = await communityService.findNearbyBeekeepers(
      latitude,
      longitude,
      radiusKm,
      req.user.id
    );

    return res.json({
      center: { latitude, longitude },
      radius: radiusKm,
      count: nearby.length,
      beekeepers: nearby,
    });
  } catch (error) {
    console.error('Error finding nearby beekeepers:', error);
    return res.status(500).json({ error: 'Failed to find nearby beekeepers' });
  }
});

/**
 * GET /api/community/map
 * Get all community members with apiaries for map display
 */
router.get('/map', authenticateToken, async (req, res) => {
  try {
    const members = await communityService.getAllCommunityMembers();
    return res.json({
      count: members.length,
      members,
    });
  } catch (error) {
    console.error('Error getting community map:', error);
    return res.status(500).json({ error: 'Failed to load community map' });
  }
});

/**
 * GET /api/community/my-apiaries
 * Get current user's apiaries with coordinates for map
 */
router.get('/my-apiaries', authenticateToken, async (req, res) => {
  try {
    const apiaries = await communityService.getUserApiariesForMap(req.user.id);
    return res.json({
      count: apiaries.length,
      apiaries,
    });
  } catch (error) {
    console.error('Error getting user apiaries:', error);
    return res.status(500).json({ error: 'Failed to load apiaries' });
  }
});

/**
 * POST /api/community/distance
 * Calculate distance between two coordinates
 */
router.post('/distance', authenticateToken, (req, res) => {
  const { from, to } = req.body;

  if (!from?.lat || !from?.lng || !to?.lat || !to?.lng) {
    return res.status(400).json({ error: 'Invalid coordinates' });
  }

  const distance = communityService.calculateDistance(
    from.lat,
    from.lng,
    to.lat,
    to.lng
  );

  return res.json({
    from,
    to,
    distance: Math.round(distance * 10) / 10,
    unit: 'km',
  });
});

module.exports = router;
