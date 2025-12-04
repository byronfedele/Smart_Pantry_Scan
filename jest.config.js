module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  roots: ['<rootDir>/webApp/tests'],
  moduleNameMapper: {
    '^@capacitor/(.*)$': '<rootDir>/__mocks__/@capacitor/$1',
  },
};
