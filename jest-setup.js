import 'whatwg-fetch';
import 'react-native-gesture-handler/jestSetup';
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';
import { setUpTests } from 'react-native-reanimated/src/reanimated2/jestUtils';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);
jest.mock('@reactvision/react-viro', () => ({ ViroMaterials: {} }));
jest.mock('expo-linking', () => ({ createURL: jest.fn() }));
jest.mock('react-native-webview', () => ({ default: () => jest.fn() }));
setUpTests();
