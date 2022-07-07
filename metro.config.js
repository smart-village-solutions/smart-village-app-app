// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

module.exports = (async () => {
  const {
    resolver: { assetExts }
  } = await getDefaultConfig(__dirname);

  return {
    transformer: {
      getTransformOptions: async () => ({
        transform: {
          experimentalImportSupport: false,
          inlineRequires: true
        }
      })
    },
    resolver: {
      assetExts: [
        ...assetExts,
        'obj',
        'mtl',
        'fbx',
        'mp3',
        'JPG',
        'vrx',
        'fbx',
        'hdr',
        'gltf',
        'glb',
        'bin',
        'arobject',
        'gif'
      ]
    }
  };
})();
