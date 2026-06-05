import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Use threads for better performance
    pool: 'threads',
    // Global test timeout
    testTimeout: 10000,
    // Setup files run before each test file
    setupFiles: ['./tests/setup.js'],
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*.js'],
      exclude: ['src/views/**', 'node_modules/**'],
      thresholds: {
        statements: 60,
        branches: 50,
        functions: 60,
        lines: 60,
      },
    },
    // Reporter
    reporters: ['verbose'],
    // Environment
    environment: 'node',
  },
});
