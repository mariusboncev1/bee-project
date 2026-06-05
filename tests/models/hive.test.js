import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { Sequelize } from 'sequelize';

describe('Hive Model', () => {
  let sequelize;
  let Hive;

  beforeAll(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
    });

    const { default: HiveModel } = await import('../../src/models/Hive.js');
    Hive = HiveModel(sequelize);
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await Hive.destroy({ where: {} });
  });

  it('should create a hive with valid data', async () => {
    const hive = await Hive.create({
      apiaryId: 1,
      number: 1,
      queenBreed: 'Carnica',
      color: '#FFD700',
    });

    expect(hive).toBeDefined();
    expect(hive.number).toBe(1);
    expect(hive.queenBreed).toBe('Carnica');
    expect(hive.status).toBe('active'); // default
  });

  it('should require apiaryId', async () => {
    await expect(
      Hive.create({ number: 1 })
    ).rejects.toThrow();
  });

  it('should require number', async () => {
    await expect(
      Hive.create({ apiaryId: 1 })
    ).rejects.toThrow();
  });

  it('should default color to orange', async () => {
    const hive = await Hive.create({
      apiaryId: 1,
      number: 5,
    });

    expect(hive.color).toBe('#FFA500');
  });

  it('should accept all valid status values', async () => {
    const active = await Hive.create({ apiaryId: 1, number: 1, status: 'active' });
    const inactive = await Hive.create({ apiaryId: 1, number: 2, status: 'inactive' });
    const sold = await Hive.create({ apiaryId: 1, number: 3, status: 'sold' });

    expect(active.status).toBe('active');
    expect(inactive.status).toBe('inactive');
    expect(sold.status).toBe('sold');
  });

  it('should accept optional queen year and hatching date', async () => {
    const hive = await Hive.create({
      apiaryId: 1,
      number: 10,
      queenYear: 2024,
      dateOfHatching: '2024-04-15',
    });

    expect(hive.queenYear).toBe(2024);
    expect(hive.dateOfHatching).toBe('2024-04-15');
  });

  it('should update hive data', async () => {
    const hive = await Hive.create({
      apiaryId: 1,
      number: 7,
      notes: 'Initial note',
    });

    await hive.update({ notes: 'Updated note', status: 'inactive' });

    expect(hive.notes).toBe('Updated note');
    expect(hive.status).toBe('inactive');
  });
});
