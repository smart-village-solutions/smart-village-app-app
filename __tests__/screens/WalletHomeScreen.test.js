import React from 'react';
import { FlatList, View } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { NavigationRouteContext } from 'expo-router/react-navigation';

import { AccessibilityContext } from '../../src/AccessibilityProvider';
import { getSavedCards } from '../../src/helpers';
import {
  ReadAloudAvailabilityProvider,
  useReadAloudAvailability
} from '../../src/ReadAloudAvailabilityProvider';
import { WalletHomeScreen } from '../../src/screens/Wallet/WalletHomeScreen';

jest.mock('expo-router/react-navigation', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const ReactLocal = require('react');
  return {
    NavigationRouteContext: ReactLocal.createContext(undefined),
    useNavigation: () => ({ navigate: jest.fn() }),
    useFocusEffect: (callback) => ReactLocal.useEffect(callback, [callback])
  };
});
jest.mock('../../src/AccessibilityProvider', () => ({
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  AccessibilityContext: require('react').createContext({ features: { readAloud: true } })
}));
jest.mock('../../src/SettingsProvider', () => ({
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  SettingsContext: require('react').createContext({ globalSettings: {} })
}));
jest.mock('../../src/config', () => ({
  consts: { SWITCH_BETWEEN_LIST_AND_MAP: { TOP_FILTER: 'top' } },
  normalize: (value) => value,
  Icon: { NamedIcon: () => null },
  texts: {
    wallet: { home: { infoText: 'Wallet information', buttonText: 'Add card' } },
    screenTitles: { wallet: { cardsList: 'Cards', detail: 'Details' } }
  }
}));
jest.mock('../../src/helpers', () => ({ getSavedCards: jest.fn() }));
jest.mock('../../src/helpers/accessibility/speechTextFormatter', () => ({
  normalizeSpeechText: (text) => text || ''
}));
jest.mock('../../src/hooks', () => ({
  useStaticContent: () => ({ data: undefined }),
  useRenderItem: () => () => null
}));
jest.mock('../../src/hooks/useTheme', () => ({ useTheme: () => ({ colors: {} }) }));
jest.mock('../../src/hooks/useThemeStyles', () => ({
  useThemeStyles: (createStyles) => createStyles({})
}));
jest.mock('../../src/queries', () => ({ QUERY_TYPES: { WALLET: 'wallet' } }));
jest.mock('../../src/types', () => ({ ScreenName: {} }));
jest.mock('../../src/components/BackToTop', () => ({ BackToTop: () => null }));
jest.mock('../../src/components/ListComponent', () => ({
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  ListComponent: require('../../src/components/VerticalList').VerticalList
}));
jest.mock('../../src/components', () => {
  /* eslint-disable @typescript-eslint/no-var-requires */
  const { View: MockView } = require('react-native');
  return {
    Button: () => null,
    HtmlView: () => null,
    LoadingSpinner: () => null,
    ReadAloudContent: require('../../src/components/ReadAloudContent').ReadAloudContent,
    SafeAreaViewFlex: MockView,
    WalletHeader: () => null,
    WalletList: require('../../src/components/wallet/WalletList').WalletList,
    Wrapper: MockView,
    WrapperRow: MockView,
    WrapperVertical: MockView
  };
  /* eslint-enable @typescript-eslint/no-var-requires */
});

const card = { cardNumber: '1234', type: 'library', title: 'Library card' };

describe('WalletHomeScreen read-aloud registration', () => {
  it.each([
    ['empty wallet', [], true],
    ['saved card with read-aloud', [card], true],
    ['saved card without read-aloud', [card], false]
  ])('keeps registration stable for %s', async (_, cards, readAloud) => {
    getSavedCards.mockResolvedValue(cards);
    let availability;
    const Probe = () => {
      availability = useReadAloudAvailability();
      return null;
    };
    const errorSpy = jest.spyOn(console, 'error').mockImplementation((message) => {
      if (String(message).includes('Maximum update depth')) {
        throw new Error('Wallet entered a render loop');
      }
    });
    let tree;

    try {
      await act(async () => {
        tree = renderer.create(
          <AccessibilityContext.Provider value={{ features: { readAloud } }}>
            <NavigationRouteContext.Provider value={{ key: 'wallet-home' }}>
              <ReadAloudAvailabilityProvider>
                <Probe />
                <WalletHomeScreen />
              </ReadAloudAvailabilityProvider>
            </NavigationRouteContext.Provider>
          </AccessibilityContext.Provider>
        );
      });
      const items = availability.getRouteItems('wallet-home');
      expect(items).toEqual(
        readAloud ? [{ id: 'wallet-home-info-content', text: 'Wallet information' }] : []
      );
      expect(tree.root.findAllByType(FlatList)).toHaveLength(cards.length ? 1 : 0);

      await act(async () => {
        availability.setPlayerBottomSpacing(80);
      });
      expect(availability.getRouteItems('wallet-home')).toEqual(items);
      expect(tree.root.findAllByType(View).length).toBeGreaterThan(0);
      expect(errorSpy).not.toHaveBeenCalled();
    } finally {
      if (tree) {
        act(() => tree.unmount());
      }
      errorSpy.mockRestore();
    }
  });
});
