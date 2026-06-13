/* eslint-disable @typescript-eslint/no-var-requires, react/prop-types */
import React from 'react';
import { Alert, TouchableOpacity } from 'react-native';
import renderer, { act } from 'react-test-renderer';

jest.mock('../../src/components', () => {
  const React = require('react');
  const { Text, View } = require('react-native');

  return {
    AugmentedReality: () => null,
    LoadingContainer: ({ children }) => <View>{children}</View>,
    RegularText: ({ children }) => <Text>{children}</Text>,
    SafeAreaViewFlex: ({ children }) => <View>{children}</View>,
    SettingsToggle: () => null,
    TextListItem: () => null,
    Wrapper: ({ children }) => <View>{children}</View>
  };
});

jest.mock('../../src/components/settings', () => ({
  ListSettings: () => null,
  LocationSettings: () => null,
  MowasRegionSettings: () => null,
  PermanentFilterSettings: () => null,
  PersonalizedPushSettings: () => null
}));

jest.mock('../../src/hooks', () => ({
  useMatomoTrackScreenView: jest.fn()
}));

jest.mock('../../src/ReactQueryProvider', () => ({
  clearPersistentCaches: jest.fn()
}));

import { SettingsScreen } from '../../src/screens/SettingsScreen';
import { SettingsContext, initialContext } from '../../src/SettingsProvider';
import { clearPersistentCaches } from '../../src/ReactQueryProvider';

describe('SettingsScreen', () => {
  const navigation = { navigate: jest.fn() };
  const route = {};
  const resetCachesLabel = 'Persistente Caches zurücksetzen';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows a dev-only persistent cache reset link and clears caches after confirmation', async () => {
    jest.mocked(clearPersistentCaches).mockResolvedValue(undefined);
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const globalSettings = {
      ...initialContext.globalSettings,
      settings: {
        pushNotifications: false
      }
    };
    let tree;

    await act(async () => {
      tree = renderer.create(
        <SettingsContext.Provider value={{ ...initialContext, globalSettings }}>
          <SettingsScreen navigation={navigation} route={route} />
        </SettingsContext.Provider>
      );
    });

    expect(tree.root.findAllByProps({ children: resetCachesLabel }).length).toBeGreaterThan(0);

    const resetLink = tree.root
      .findAllByType(TouchableOpacity)
      .find((node) => node.findAllByProps({ children: resetCachesLabel }).length > 0);

    await act(async () => {
      resetLink.props.onPress();
    });

    expect(alertSpy).toHaveBeenCalledWith(
      'Persistente Caches zurücksetzen',
      'Sollen die persistenten Caches zurückgesetzt werden?',
      expect.arrayContaining([
        expect.objectContaining({ text: 'Abbrechen', style: 'cancel' }),
        expect.objectContaining({ text: 'Zurücksetzen' })
      ]),
      { cancelable: true }
    );

    const confirmButton = alertSpy.mock.calls[0][2][1];

    await act(async () => {
      await confirmButton.onPress();
    });

    expect(clearPersistentCaches).toHaveBeenCalledTimes(1);
    alertSpy.mockRestore();
  });
});
