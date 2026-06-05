import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { Sequelize } from 'sequelize';

describe('Apiary Model', () => {
  let sequelize;
  let Apiary;

  beforeAll(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
    });

    const { default: ApiaryModel } = await import('../../src/models/Apiary.js');
    Apiary = ApiaryModel(sequelize);
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await Apiary.destroy({ where: {} });
  });

  it('should create an apiary with valid data', async () => {
    const apiary = await Apiary.create({
      userId: 1,
      name: 'Mountain Apiary',
      city: 'Cluj-Napoca',
      description: 'Beautiful mountain apiary',
    });

    expect(apiary).toBeDefined();
    expect(apiary.id).toBeDefined();
    expect(apiary.name).toBe('Mountain Apiary');
    expect(apiary.city).toBe('Cluj-Napoca');
  });

  it('should require userId', async () => {
    await expect(
      Apiary.create({
        name: 'No User Apiary',
      })
    ).rejects.toThrow();
  });

  it('should require name', async () => {
    await expect(
      Apiary.create({
        userId: 1,
      })
    ).rejects.toThrow();
  });

  it('should accept optional GPS coordinates', async () => {
    const apiary = await Apiary.create({
      userId: 1,
      name: 'GPS Apiary',
      latitude: 46.7712,
      longitude: 23.6236,
      metersAboveSeaLevel: 350,
    });

    expect(apiary.latitude).toBeCloseTo(46.7712);
    expect(apiary.longitude).toBeCloseTo(23.6236);
    expect(apiary.metersAboveSeaLevel).toBe(350);
  });

  it('should accept optional registration fields', async () => {
    const apiary = await Apiary.create({
      userId: 1,
      name: 'Registered Apiary',
      registrationNumber: 'REG-2024-001',
      cadastralTerritory: 'Zone A',
    });

    expect(apiary.registrationNumber).toBe('REG-2024-001');
    expect(apiary.cadastralTerritory).toBe('Zone A');
  });

  it('should have timestamps', async () => {
    const apiary = await Apiary.create({
      userId: 1,
      name: 'Timestamp Apiary',
    });

    expect(apiary.createdAt).toBeDefined();
    expect(apiary.updatedAt).toBeDefined();
  });

  it('should update apiary fields', async () => {
    const apiary = await Apiary.create({
      userId: 1,
      name: 'Old Name',
    });

    await apiary.update({ name: 'New Name', city: 'Bucharest' });

    expect(apiary.name).toBe('New Name');
    expect(apiary.city).toBe('Bucharest');
  });

  it('should delete an apiary', async () => {
    const apiary = await Apiary.create({
      userId: 1,
      name: 'To Delete',
    });

    const id = apiary.id;
    await apiary.destroy();
    const found = await Apiary.findByPk(id);

    expect(found).toBeNull();
  });
});
