const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
  sequelize.define('Inspection', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    hiveId: { type: DataTypes.INTEGER, allowNull: false },
    inspectedAt: { type: DataTypes.DATEONLY, allowNull: false, defaultValue: DataTypes.NOW },
    queenSeen: { type: DataTypes.BOOLEAN, defaultValue: false },
    broodFrames: { type: DataTypes.INTEGER, defaultValue: 0 },
    honeyFrames: { type: DataTypes.INTEGER, defaultValue: 0 },
    temperament: { type: DataTypes.ENUM('calm', 'moderate', 'aggressive'), defaultValue: 'calm' },
    honeyHarvestKg: { type: DataTypes.FLOAT, defaultValue: 0 },
    treatments: { type: DataTypes.STRING },
    notes: { type: DataTypes.TEXT },
  }, { tableName: 'inspections', timestamps: true });
