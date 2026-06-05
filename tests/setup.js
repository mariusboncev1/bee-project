/**
 * Vitest Global Test Setup
 * Configures test environment: in-memory SQLite, resets DB between tests.
 */

// Force SQLite for tests
process.env.DB_DIALECT = 'sqlite';
process.env.DB_STORAGE = ':memory:';
process.env.SESSION_SECRET = 'test_secret';
process.env.JWT_SECRET = 'test_jwt_secret';
process.env.JWT_REFRESH_SECRET = 'test_jwt_refresh_secret';
process.env.NODE_ENV = 'test';
process.env.PORT = '0'; // Random port for tests
