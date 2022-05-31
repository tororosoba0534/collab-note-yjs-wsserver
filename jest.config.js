/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

// module.exports = {
//   clearMocks: true,
//   collectCoverage: true,
//   coverageDirectory: "coverage",
//   coverageProvider: "v8",

//   transform: {},

//   preset: "ts-jest",
//   testEnvironment: "jsdom",
//   extensionsToTreatAsEsm: [".ts"],
//   globals: {
//     "ts-jest": {
//       useESM: true,
//     },
//   },
//   moduleNameMapper: {
//     "^(\\.{1,2}/.*)\\.js$": "$1",
//   },
// };

module.exports = {
  // // Jestの検索対象となるパス
  // roots: [
  //   "<rootDir>"
  // ],
  // テストコードを書いたファイルを特定するための条件
  testMatch: ["**/__tests__/**/*.+(ts|tsx|js)", "./**/*.test.+(ts|tsx|js)"],
  // ts/tsxファイルに対してts-jestを使うよう設定
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
};
