/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest",
  extensionsToTreatAsEsm: [".ts"],
  globals: {
    "ts-jest": {
      useESM: true,
    },
  },
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  testEnvironment: "node",
  rootDir: "./src",
  transform: {
    "\\.jsx?$": "babel-jest",
    "\\.tsx?$": "ts-jest",
  },
  transformIgnorePatterns: [
    "/node_modules/(?!lib0|express|y-protocols).+\\.js",
  ],
};
