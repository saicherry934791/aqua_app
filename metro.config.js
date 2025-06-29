const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');
 
const config = getDefaultConfig(__dirname);

// Add resolver alias for web compatibility
config.resolver.alias = {
  ...config.resolver.alias,
  'react-native-maps': 'react-native-web-maps',
};

// Platform-specific extensions
config.resolver.platforms = ['web', 'ios', 'android', 'native'];

module.exports = withNativeWind(config, { input: './global.css' });