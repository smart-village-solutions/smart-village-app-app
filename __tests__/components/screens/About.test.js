import React from 'react';
import renderer, { act } from 'react-test-renderer';

import { About } from '../../../src/components/screens/About';
import { useStaticContent } from '../../../src/hooks';

jest.mock('../../../src/config', () => ({
  normalize: (value) => value,
  texts: { homeTitles: { about: 'Menu' }, screenTitles: { appSettings: 'Settings' } }
}));
jest.mock('../../../src/queries', () => ({ QUERY_TYPES: { PUBLIC_JSON_FILE: 'publicJsonFile' } }));
jest.mock('../../../src/SettingsProvider', () => ({
  SettingsContext: jest.requireActual('react').createContext({ globalSettings: {} })
}));
jest.mock('../../../src/NetworkProvider', () => ({
  NetworkContext: jest.requireActual('react').createContext({ isConnected: true })
}));
jest.mock('../../../src/components/SectionHeader', () => ({ SectionHeader: () => null }));
jest.mock('../../../src/components/VersionNumber', () => ({ VersionNumber: () => null }));
jest.mock('../../../src/components/LoadingContainer', () => ({ LoadingContainer: () => null }));
jest.mock('../../../src/hooks/useTheme', () => ({ useTheme: () => ({ colors: {} }) }));
jest.mock('../../../src/hooks/useThemeStyles', () => ({ useThemeStyles: (factory) => factory() }));

jest.mock('../../../src/hooks', () => ({
  useHomeRefresh: jest.fn(),
  useStaticContent: jest.fn(),
  useRenderItem:
    (_query, navigation) =>
    ({ item }) =>
      jest.requireActual('react').createElement('about-entry', {
        route: item.routeName,
        onPress: () => navigation.navigate(item.routeName)
      })
}));

it.each([undefined, [], {}])(
  'keeps settings reachable without a usable about menu: %p',
  async (data) => {
    useStaticContent.mockReturnValue({ data, loading: false });
    const navigation = { navigate: jest.fn() };
    let tree;
    await act(async () => {
      tree = renderer.create(<About navigation={navigation} withSettings />);
    });
    const entry = tree.root.findByProps({ route: 'Settings' });
    await act(async () => {
      entry.props.onPress();
    });
    expect(navigation.navigate).toHaveBeenCalledWith('Settings');
    await act(async () => {
      tree.unmount();
    });
  }
);
