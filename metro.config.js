// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const connect = require('connect');
const { simMiddleware } = require('serve-sim/middleware');

const config = getDefaultConfig(__dirname);

config.resolver = {
  ...config.resolver,
  assetExts: config.resolver.assetExts.filter((ext) => ext !== 'svg').concat('mtl', 'obj', 'vrx'),
  sourceExts: [...config.resolver.sourceExts, 'svg']
};
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer'),
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true
    }
  })
};

config.server = config.server || {};
const originalEnhanceMiddleware = config.server.enhanceMiddleware;
config.server.enhanceMiddleware = (metroMiddleware, server) => {
  const middleware = originalEnhanceMiddleware
    ? originalEnhanceMiddleware(metroMiddleware, server)
    : metroMiddleware;
  const app = connect();
  app.use(simMiddleware({ basePath: '/.sim' }));
  app.use(middleware);
  return app;
};

module.exports = config;
