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

// Block native-only modules from being imported on web
config.resolver.blockList = [
  // Block specific native-only modules
  /node_modules\/react-native\/Libraries\/Utilities\/codegenNativeCommands\.js$/,
  /node_modules\/react-native\/Libraries\/Components\/.*NativeComponent\.js$/,
];

// Add platform-specific resolver
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Configure transformer for better web compatibility
config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

module.exports = withNativeWind(config, { input: './global.css' });