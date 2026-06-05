import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { Sequelize } from 'sequelize';

describe('User Model', () => {
  let sequelize;
  let User;

  beforeAll(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
    });

    const { default: UserModel } = await import('../../src/models/User.js');
    User = UserModel(sequelize);
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await User.destroy({ where: {} });
  });

  it('should create a user with valid data', async () => {
    const user = await User.create({
      name: 'Test Beekeeper',
      email: 'test@apinote.com',
      password: 'hashedPassword123',
    });

    expect(user).toBeDefined();
    expect(user.id).toBeDefined();
    expect(user.name).toBe('Test Beekeeper');
    expect(user.email).toBe('test@apinote.com');
    expect(user.role).toBe('beekeeper'); // default role
  });

  it('should enforce unique email constraint', async () => {
    await User.create({
      name: 'First User',
      email: 'duplicate@apinote.com',
      password: 'hash1',
    });

    await expect(
      User.create({
        name: 'Second User',
        email: 'duplicate@apinote.com',
        password: 'hash2',
      })
    ).rejects.toThrow();
  });

  it('should reject user without required name', async () => {
    await expect(
      User.create({
        email: 'noname@apinote.com',
        password: 'hash',
      })
    ).rejects.toThrow();
  });

  it('should reject user without required email', async () => {
    await expect(
      User.create({
        name: 'No Email User',
        password: 'hash',
      })
    ).rejects.toThrow();
  });

  it('should reject user without required password', async () => {
    await expect(
      User.create({
        name: 'No Pass User',
        email: 'nopass@apinote.com',
      })
    ).rejects.toThrow();
  });

  it('should validate email format', async () => {
    await expect(
      User.create({
        name: 'Bad Email',
        email: 'not-an-email',
        password: 'hash',
      })
    ).rejects.toThrow();
  });

  it('should accept valid roles', async () => {
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@apinote.com',
      password: 'hash',
      role: 'admin',
    });

    expect(admin.role).toBe('admin');
  });

  it('should have timestamps', async () => {
    const user = await User.create({
      name: 'Timestamp User',
      email: 'time@apinote.com',
      password: 'hash',
    });

    expect(user.createdAt).toBeDefined();
    expect(user.updatedAt).toBeDefined();
  });
});
