const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
  sequelize.define('UserProfile', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    phone: { type: DataTypes.STRING },
    city: { type: DataTypes.STRING },
    yearsExperience: { type: DataTypes.INTEGER, defaultValue: 0 },
    bio: { type: DataTypes.TEXT },
    avatarUrl: { type: DataTypes.STRING },
  }, { tableName: 'user_profiles', timestamps: true });
