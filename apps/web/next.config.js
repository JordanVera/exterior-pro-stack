const path = require('path');

module.exports = {
  reactStrictMode: true,
  transpilePackages: ['@repo/api', '@repo/db', '@repo/validators'],
  // outputFileTracingRoot: path.join(__dirname, '../..'),
};
