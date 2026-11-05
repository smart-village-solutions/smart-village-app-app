import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { registerRootComponent } from 'expo';

import { textsByLocale, setTextsLocale } from '../src/config/texts';
import { initializeTextsLocale } from '../src/helpers/textsLocaleHelper';

const mockAppCapture = jest.fn();
jest.mock('expo', () => ({ registerRootComponent: jest.fn() }));
jest.mock('expo-dev-client', () => ({}));
jest.mock('react-native-reanimated', () => ({}));
jest.mock('react-native-gesture-handler', () => ({}));
jest.mock('expo-splash-screen', () => ({ preventAutoHideAsync: jest.fn() }));
jest.mock('../src/helpers/textsLocaleHelper', () => ({ initializeTextsLocale: jest.fn() }));
jest.mock('../App', () => {
  const { texts } = jest.requireActual('../src/config/texts');
  mockAppCapture(texts.close);
  return { __esModule: true, default: () => null };
});

it('selects the saved language before requiring App and its captured module labels', async () => {
  let finishRestore;
  initializeTextsLocale.mockImplementation(
    () =>
      new Promise((resolve) => {
        finishRestore = resolve;
      })
  );
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('../index');
  const Bootstrap = registerRootComponent.mock.calls[0][0];
  let tree;
  await act(async () => {
    tree = renderer.create(<Bootstrap />);
  });
  expect(mockAppCapture).not.toHaveBeenCalled();
  textsByLocale['pt-PT'] = { ...textsByLocale.de, close: 'Fechar' };
  await act(async () => {
    finishRestore(setTextsLocale('pt-PT'));
  });
  expect(mockAppCapture).toHaveBeenCalledWith('Fechar');
  await act(async () => {
    tree.unmount();
  });
  delete textsByLocale['pt-PT'];
  setTextsLocale('de');
});
