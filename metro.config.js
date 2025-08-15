const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname)

config.resolver.alias = {
  ...config.resolver.alias,
  'ws': false,
  'fs': false,
  'crypto': 'react-native-crypto',
  'stream': 'readable-stream',
  'buffer': '@craftzdog/react-native-buffer',
};

config.resolver.fallback = {
  ...config.resolver.fallback,
  'ws': false,
  'fs': false,
  'crypto': require.resolve('react-native-crypto'),
  'stream': require.resolve('readable-stream'),
  'buffer': require.resolve('@craftzdog/react-native-buffer'),
};

module.exports = withNativeWind(config, { input: './global.css' })
