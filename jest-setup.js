import 'whatwg-fetch';
import 'react-native-gesture-handler/jestSetup';
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';
import React from 'react';
import { setUpTests } from 'react-native-reanimated';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);
jest.mock('@reactvision/react-viro', () => ({ ViroMaterials: {} }));
jest.mock('expo-linking', () => ({ createURL: jest.fn() }));
jest.mock('expo-updates', () => ({
  __esModule: true,
  checkForUpdateAsync: jest.fn(async () => ({ isAvailable: false })),
  fetchUpdateAsync: jest.fn(async () => ({})),
  isEnabled: true,
  reloadAsync: jest.fn(async () => undefined)
}));
jest.mock('react-native-color-matrix-image-filters', () => ({
  Grayscale: ({ children }) => <>{children}</>
}));
jest.mock('react-native-webview', () => ({ default: () => jest.fn() }));
setUpTests();
