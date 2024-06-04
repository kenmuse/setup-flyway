import type { JestConfigWithTsJest } from 'ts-jest'
import preset from 'ts-jest/presets/index.js';

const config: JestConfigWithTsJest = {
  ...preset.defaultsESM,
  clearMocks: true,
  moduleFileExtensions: ['mjs', 'mts', 'js', 'ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.m?js$': '$1',
  },
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts', '**/*.test.mts'],
  testRunner: 'jest-circus/runner',
  transform: {
    '^.+\\.m?[jt]s$': [
      'ts-jest', {
        useESM: true,
        tsconfig: './tsconfig.json',
        isolatedModules: true,
        rootDir: './test'
      }]
  },
  verbose: false,

  resolver: 'ts-jest-resolver',
  extensionsToTreatAsEsm: ['.ts']
};

export default config;