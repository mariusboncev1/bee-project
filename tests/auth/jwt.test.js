import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Sequelize } from 'sequelize';
import bcrypt from 'bcryptjs';

describe('JWT Authentication Flow', () => {
  let sequelize, User, RefreshToken;

  beforeAll(async () => {
    sequelize = new Sequelize({ dialect: 'sqlite', storage: ':memory:', logging: false });
    const { default: UserModel } = await import('../../src/models/User.js');
    const { default: RefreshTokenModel } = await import('../../src/models/RefreshToken.js');
    User = UserModel(sequelize);
    RefreshToken = RefreshTokenModel(sequelize);
    RefreshToken.belongsTo(User, { foreignKey: 'userId' });
    User.hasMany(RefreshToken, { foreignKey: 'userId' });
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('should create user with hashed password', async () => {
    const hash = await bcrypt.hash('password123', 10);
    const user = await User.create({
      name: 'Auth Test User',
      email: 'auth@test.com',
      password: hash,
    });

    expect(user.password).not.toBe('password123');
    const isValid = await bcrypt.compare('password123', user.password);
    expect(isValid).toBe(true);
  });

  it('should store refresh token with expiry', async () => {
    const user = await User.create({
      name: 'Token User',
      email: 'token@test.com',
      password: await bcrypt.hash('pass', 10),
    });

    const token = await RefreshToken.create({
      token: 'mock_refresh_token_xyz',
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    expect(token.token).toBe('mock_refresh_token_xyz');
    expect(token.userId).toBe(user.id);
    expect(token.isRevoked).toBe(false);
  });

  it('should revoke refresh token', async () => {
    const user = await User.create({
      name: 'Revoke User',
      email: 'revoke@test.com',
      password: await bcrypt.hash('pass', 10),
    });

    const token = await RefreshToken.create({
      token: 'revoke_token',
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    token.isRevoked = true;
    await token.save();

    const updated = await RefreshToken.findByPk(token.id);
    expect(updated.isRevoked).toBe(true);
  });
});
