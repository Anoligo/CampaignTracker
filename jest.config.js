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
        '^https://cdn\\.jsdelivr\\.net/npm/uuid@8\\.3\\.2/dist/esm-browser/index\\.js$': '<rootDir>/tests/mocks/uuid.js',
        '^@/scripts/modules/players/index.js$': '<rootDir>/tests/mocks/players-index.js',
        '^@/scripts/modules/guild/index.js$': '<rootDir>/tests/mocks/guild-index.js',
        '^@/scripts/modules/quests/index.js$': '<rootDir>/tests/mocks/quests-index.js',
        '^@/scripts/modules/loot.js$': '<rootDir>/tests/mocks/loot.js',
        '^../../players/index.js$': '<rootDir>/tests/mocks/players-index.js',
        '^../../guild/index.js$': '<rootDir>/tests/mocks/guild-index.js',
        '^../../quests/index.js$': '<rootDir>/tests/mocks/quests-index.js',
        '^../../loot.js$': '<rootDir>/tests/mocks/loot.js'
    },
    verbose: true,
    testTimeout: 10000
}; 