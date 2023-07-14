import 'whatwg-fetch';
import 'react-native-gesture-handler/jestSetup';
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';
import { setUpTests } from 'react-native-reanimated/lib/reanimated2/jestUtils';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);
jest.mock('@viro-community/react-viro', () => ({ ViroMaterials: {} }));
jest.mock('expo-linking', () => ({ createURL: jest.fn() }));
setUpTests();
