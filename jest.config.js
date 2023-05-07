module.exports = {
  testEnvironment: "node",
  preset: "ts-jest",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^#/(.*)$": "<rootDir>/$1",
  },

  clearMocks: true,
  setupFilesAfterEnv: ["<rootDir>/prisma/singleton.ts"],
};
