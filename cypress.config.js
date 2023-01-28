const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8080',
    supportFile: 'tests/support/index.js',
    specPattern: 'tests/functional',
  },
  fixturesFolder: false,
  numTestsKeptInMemory: 0,
  video: false,
})
