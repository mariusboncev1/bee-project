const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
  sequelize.define('Hive', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    apiaryId: { type: DataTypes.INTEGER, allowNull: false },
    number: { type: DataTypes.INTEGER, allowNull: false },
    queenYear: { type: DataTypes.INTEGER },
    queenBreed: { type: DataTypes.STRING },
    color: { type: DataTypes.STRING, defaultValue: '#FFA500' },
    dateOfHatching: { type: DataTypes.DATEONLY },
    notes: { type: DataTypes.TEXT },
    status: { type: DataTypes.ENUM('active', 'inactive', 'sold'), defaultValue: 'active' },
  }, { tableName: 'hives', timestamps: true });
