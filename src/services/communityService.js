/**
 * Community Service - Locate Nearby Beekeepers
 * Enables beekeepers to find and connect with others in their area
 */

const { User, UserProfile, Apiary } = require('../models');
const { Sequelize } = require('sequelize');

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 
 * @param {number} lon1 
 * @param {number} lat2 
 * @param {number} lon2 
 * @returns {number} Distance in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Find beekeepers near a specific location
 * @param {number} latitude 
 * @param {number} longitude 
 * @param {number} radiusKm - Search radius in kilometers
 * @param {number} excludeUserId - Exclude this user from results
 * @returns {Promise<Array>}
 */
async function findNearbyBeekeepers(latitude, longitude, radiusKm = 50, excludeUserId = null) {
  try {
    // Get all apiaries with GPS coordinates
    const apiaries = await Apiary.findAll({
      where: {
        latitude: { [Sequelize.Op.not]: null },
        longitude: { [Sequelize.Op.not]: null },
      },
      include: [{
        model: User,
        as: 'owner',
        attributes: ['id', 'name', 'email', 'createdAt'],
        where: excludeUserId ? { id: { [Sequelize.Op.ne]: excludeUserId } } : {},
        include: [{
          model: UserProfile,
          as: 'profile',
          attributes: ['bio', 'phone', 'experienceYears'],
        }],
      }],
    });

    // Calculate distances and filter by radius
    const nearby = apiaries
      .map(apiary => {
        const distance = calculateDistance(
          latitude,
          longitude,
          apiary.latitude,
          apiary.longitude
        );

        return {
          userId: apiary.owner.id,
          userName: apiary.owner.name,
          email: apiary.owner.email,
          bio: apiary.owner.profile?.bio,
          phone: apiary.owner.profile?.phone,
          experienceYears: apiary.owner.profile?.experienceYears,
          memberSince: apiary.owner.createdAt,
          apiary: {
            id: apiary.id,
            name: apiary.name,
            city: apiary.city,
            latitude: apiary.latitude,
            longitude: apiary.longitude,
          },
          distance: Math.round(distance * 10) / 10, // Round to 1 decimal
        };
      })
      .filter(item => item.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);

    return nearby;
  } catch (error) {
    console.error('Error finding nearby beekeepers:', error);
    throw error;
  }
}

/**
 * Get all beekeepers for community map (with public apiaries)
 * @returns {Promise<Array>}
 */
async function getAllCommunityMembers() {
  try {
    const apiaries = await Apiary.findAll({
      where: {
        latitude: { [Sequelize.Op.not]: null },
        longitude: { [Sequelize.Op.not]: null },
      },
      include: [{
        model: User,
        as: 'owner',
        attributes: ['id', 'name', 'createdAt'],
        include: [{
          model: UserProfile,
          as: 'profile',
          attributes: ['bio', 'experienceYears'],
        }],
      }],
      attributes: ['id', 'name', 'city', 'latitude', 'longitude', 'userId'],
    });

    return apiaries.map(apiary => ({
      userId: apiary.owner.id,
      userName: apiary.owner.name,
      bio: apiary.owner.profile?.bio,
      experienceYears: apiary.owner.profile?.experienceYears,
      memberSince: apiary.owner.createdAt,
      apiary: {
        id: apiary.id,
        name: apiary.name,
        city: apiary.city,
        latitude: apiary.latitude,
        longitude: apiary.longitude,
      },
    }));
  } catch (error) {
    console.error('Error getting community members:', error);
    throw error;
  }
}

/**
 * Get user's apiaries with coordinates for map display
 * @param {number} userId 
 * @returns {Promise<Array>}
 */
async function getUserApiariesForMap(userId) {
  try {
    const apiaries = await Apiary.findAll({
      where: { 
        userId,
        latitude: { [Sequelize.Op.not]: null },
        longitude: { [Sequelize.Op.not]: null },
      },
      attributes: ['id', 'name', 'city', 'latitude', 'longitude', 'description'],
      include: [{
        association: 'hives',
        attributes: ['id', 'number', 'status'],
      }],
    });

    return apiaries.map(apiary => ({
      id: apiary.id,
      name: apiary.name,
      city: apiary.city,
      latitude: apiary.latitude,
      longitude: apiary.longitude,
      description: apiary.description,
      hiveCount: apiary.hives?.length || 0,
    }));
  } catch (error) {
    console.error('Error getting user apiaries for map:', error);
    throw error;
  }
}

module.exports = {
  findNearbyBeekeepers,
  getAllCommunityMembers,
  getUserApiariesForMap,
  calculateDistance,
};
