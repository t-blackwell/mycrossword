import type { JestConfigWithTsJest } from 'ts-jest';

export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleDirectories: ['node_modules', 'lib'],
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/lib/$1',
    '\\.(css|less|scss)$': 'identity-obj-proxy',
  },
  setupFilesAfterEnv: ['<rootDir>/setupTests.ts'],
  testRegex: '(/__tests__/.*|lib/.*\\.(test|spec))\\.[jt]sx?$',
} satisfies JestConfigWithTsJest;
