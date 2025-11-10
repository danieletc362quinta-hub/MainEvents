module.exports = {
  ...require('./jest.config.js'),
  testMatch: ['**/__tests__/integration/**/*.test.{js,jsx,ts,tsx}'],
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  // Configuración específica para pruebas de integración
  testEnvironmentOptions: {
    url: 'http://localhost',
  },
  // Ignorar node_modules excepto las necesarias
  transformIgnorePatterns: [
    'node_modules/(?!(axios|i18next|react-i18next|@testing-library)/)',
  ],
  // Tiempo de espera más largo para pruebas de integración
  testTimeout: 10000,
};
