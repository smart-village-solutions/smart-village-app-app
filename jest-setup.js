import 'whatwg-fetch';
import 'react-native-gesture-handler/jestSetup';
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);
jest.mock(
  '@react-native-community/netinfo',
  () => require('@react-native-community/netinfo/jest/netinfo-mock')
);
jest.mock('@apollo/react-hooks', () => ({
  useLazyQuery: jest.fn(() => [jest.fn(), { data: undefined, loading: false }]),
  useMutation: jest.fn(() => [jest.fn(async () => undefined), { loading: false }]),
  useQuery: jest.fn(() => ({
    data: undefined,
    fetchMore: jest.fn(),
    loading: false,
    refetch: jest.fn()
  }))
}));
jest.mock('react-native-worklets', () => require('react-native-worklets/lib/module/mock'));
jest.mock('@reactvision/react-viro', () => ({ ViroMaterials: {} }));
jest.mock('expo-linking', () => ({ createURL: jest.fn() }));
jest.mock('expo-updates', () => ({
  __esModule: true,
  checkForUpdateAsync: jest.fn(async () => ({ isAvailable: false })),
  fetchUpdateAsync: jest.fn(async () => ({})),
  isEnabled: true,
  reloadAsync: jest.fn(async () => undefined)
}));
jest.mock('expo-in-app-updates', () => ({
  checkForUpdate: jest.fn(async () => ({ updateAvailable: false })),
  startUpdate: jest.fn(async () => undefined)
}));
jest.mock('expo-media-library', () => ({
  addAssetsToAlbumAsync: jest.fn(async () => undefined),
  createAlbumAsync: jest.fn(async () => undefined),
  createAssetAsync: jest.fn(async (uri) => ({ uri })),
  getAlbumAsync: jest.fn(async () => null),
  requestPermissionsAsync: jest.fn(async () => ({ status: 'granted' }))
}));
jest.mock('expo-video', () => ({
  useVideoPlayer: jest.fn((_source, setup) => {
    const player = { loop: false, pause: jest.fn(), play: jest.fn() };
    setup?.(player);
    return player;
  }),
  VideoView: () => null
}));
jest.mock('@maplibre/maplibre-react-native', () => {
  const React = require('react');

  const createMockComponent = (displayName) => {
    const Component = React.forwardRef(({ children }, ref) => {
      React.useImperativeHandle(ref, () => ({
        fitBounds: jest.fn(),
        getClusterExpansionZoom: jest.fn(async () => 0),
        getZoom: jest.fn(async () => 0),
        setStop: jest.fn()
      }));

      return React.createElement(displayName, null, children);
    });

    Component.displayName = displayName;

    return Component;
  };

  return {
    Camera: createMockComponent('Camera'),
    GeoJSONSource: createMockComponent('GeoJSONSource'),
    Images: createMockComponent('Images'),
    Layer: createMockComponent('Layer'),
    Map: createMockComponent('Map'),
    NativeUserLocation: createMockComponent('NativeUserLocation'),
    ViewAnnotation: createMockComponent('ViewAnnotation')
  };
});
jest.mock('react-native-barcode-creator', () => {
  const React = require('react');

  return {
    BarcodeCreatorView: () => React.createElement('BarcodeCreatorView'),
    BarcodeFormat: {
      CODE128: 'CODE128',
      QR: 'QR'
    }
  };
});
jest.mock('react-native-pdf', () => {
  const React = require('react');

  return () => React.createElement('Pdf');
});
jest.mock('react-native-keyboard-controller', () => {
  const React = require('react');

  return {
    KeyboardProvider: ({ children }) => children,
    KeyboardAvoidingView: ({ children }) =>
      React.createElement('KeyboardAvoidingView', null, children),
    useReanimatedKeyboardAnimation: () => ({
      height: { value: 0 },
      progress: { value: 0 }
    })
  };
});
jest.mock('react-native-webview', () => ({ default: () => jest.fn() }));

const { setUpTests } = require('react-native-reanimated');

setUpTests();
