module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/webApp/tests/setup.js'],
  // This workaround maps the problematic package to its correct path.
  moduleNameMapper: {
    'parse5': '<rootDir>/node_modules/parse5/dist/index.js'
  }
};
