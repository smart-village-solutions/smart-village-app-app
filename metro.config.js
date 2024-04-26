// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('@expo/metro-config');

module.exports = (async () => {
  const config = await getDefaultConfig(__dirname);
  const {
    transformer,
    resolver: { assetExts, sourceExts },
  } = config;

  config.transformer = {
    ...transformer,
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  };

  config.resolver = {
    assetExts: assetExts.filter(ext => ext !== 'svg').concat('mtl', 'obj', 'vrx'),
    sourceExts: [...sourceExts, 'svg'],
  };

  return config;
})();