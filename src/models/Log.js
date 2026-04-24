const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
  sequelize.define('Log', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER },
    action: { type: DataTypes.STRING, allowNull: false },
    entity: { type: DataTypes.STRING },
    entityId: { type: DataTypes.INTEGER },
    details: { type: DataTypes.TEXT },
    ip: { type: DataTypes.STRING },
  }, { tableName: 'logs', timestamps: true });
