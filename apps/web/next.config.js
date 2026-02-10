module.exports = {
  reactStrictMode: true,
  transpilePackages: ['@repo/ui', '@repo/api', '@repo/db', '@repo/validators'],
  turbopack: {
    resolveAlias: {
      // Transform all direct `react-native` imports to `react-native-web`
      'react-native': 'react-native-web',
    },
    resolveExtensions: [
      '.web.js',
      '.web.jsx',
      '.web.ts',
      '.web.tsx',
      '.js',
      '.jsx',
      '.ts',
      '.tsx',
      '.json',
    ],
  },
};
