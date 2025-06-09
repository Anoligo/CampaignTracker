export default {
    testEnvironment: 'jsdom',
    transform: {
        '^.+\\.js$': 'babel-jest'
    },
    moduleFileExtensions: ['js'],
    testMatch: ['**/tests/**/*.test.js'],
    setupFilesAfterEnv: ['<rootDir>/tests/test-setup.js'],
    transformIgnorePatterns: [
        'node_modules/(?!(bootstrap)/)'
    ],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
        '^https://cdn\\.jsdelivr\\.net/npm/uuid@8\\.3\\.2/dist/esm-browser/index\\.js$': '<rootDir>/tests/mocks/uuid.js'
    },
    verbose: true,
    testTimeout: 10000
}; 