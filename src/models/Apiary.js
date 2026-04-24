const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
  sequelize.define('Apiary', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    city: { type: DataTypes.STRING },
    registrationNumber: { type: DataTypes.STRING },
    cadastralTerritory: { type: DataTypes.STRING },
    description: { type: DataTypes.TEXT },
    metersAboveSeaLevel: { type: DataTypes.INTEGER },
    latitude: { type: DataTypes.FLOAT },
    longitude: { type: DataTypes.FLOAT },
  }, { tableName: 'apiaries', timestamps: true });
