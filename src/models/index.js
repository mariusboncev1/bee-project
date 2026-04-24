require('dotenv').config();
const { Sequelize } = require('sequelize');
const path = require('path');

let sequelize;

if (process.env.DB_DIALECT === 'sqlite') {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../../data/apinote.sqlite'),
    logging: false,
  });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT) || 5432,
      dialect: 'postgres',
      logging: false,
      dialectOptions:
        process.env.DB_SSL === 'true'
          ? { ssl: { require: true, rejectUnauthorized: false } }
          : {},
    }
  );
}

// ── Model imports ──────────────────────────────────────────────
const User        = require('./User')(sequelize);
const UserProfile = require('./UserProfile')(sequelize);
const Apiary      = require('./Apiary')(sequelize);
const Hive        = require('./Hive')(sequelize);
const Inspection  = require('./Inspection')(sequelize);
const Log         = require('./Log')(sequelize);

// ── Associations ───────────────────────────────────────────────
// User 1:1 UserProfile
User.hasOne(UserProfile, { foreignKey: 'userId', as: 'profile', onDelete: 'CASCADE' });
UserProfile.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User 1:N Apiary
User.hasMany(Apiary, { foreignKey: 'userId', as: 'apiaries', onDelete: 'CASCADE' });
Apiary.belongsTo(User, { foreignKey: 'userId', as: 'owner' });

// Apiary 1:N Hive
Apiary.hasMany(Hive, { foreignKey: 'apiaryId', as: 'hives', onDelete: 'CASCADE' });
Hive.belongsTo(Apiary, { foreignKey: 'apiaryId', as: 'apiary' });

// Hive 1:N Inspection
Hive.hasMany(Inspection, { foreignKey: 'hiveId', as: 'inspections', onDelete: 'CASCADE' });
Inspection.belongsTo(Hive, { foreignKey: 'hiveId', as: 'hive' });

// User 1:N Log
User.hasMany(Log, { foreignKey: 'userId', as: 'logs', onDelete: 'SET NULL' });
Log.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = { sequelize, User, UserProfile, Apiary, Hive, Inspection, Log };
