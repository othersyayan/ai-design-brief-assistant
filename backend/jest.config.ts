/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  roots: ['<rootDir>/src'],
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
        isolatedModules: true,
      },
    ],
  },
  collectCoverageFrom: ['src/**/*.(t|j)s'],
  coverageDirectory: 'coverage',
  testEnvironment: 'node',

  transformIgnorePatterns: [
    '/node_modules/(?!(\\.pnpm/.*(@nestjs|@google)|@nestjs|@google/generative-ai)/)',
  ],

  moduleNameMapper: {
    '^(\\.\\.?/.*)\\.js$': '$1',
  },
};
