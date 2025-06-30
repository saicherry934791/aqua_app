module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      "nativewind/babel",
      ["babel-preset-expo", { jsxImportSource: "nativewind" }]
    ],
    plugins: [
      "expo-router/babel",
      "react-native-reanimated/plugin", // Must be last
    ],
  };
};
