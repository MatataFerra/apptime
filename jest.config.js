module.exports = {
  preset: "ts-jest/presets/js-with-ts",
  testEnvironment: "node",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^#/(.*)$": "<rootDir>/$1",
  },

  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        // Aquí va tu configuración de ts-jest
        // isolatedModules: true,
        tsconfig: "tsconfig.json",
      },
    ],

    "^.+\\.(js|jsx|ts|tsx)$": ["babel-jest", { presets: ["next/babel"] }],
  },

  clearMocks: true,
  setupFilesAfterEnv: ["<rootDir>/prisma/singleton.ts", "./jest.setup.js"],
};
