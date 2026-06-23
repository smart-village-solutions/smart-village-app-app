/* eslint-disable @typescript-eslint/no-var-requires, react/prop-types */
import React from 'react';
import renderer, { act } from 'react-test-renderer';

import { NetworkContext } from '../../src/NetworkProvider';
import { DefectReportFormScreen } from '../../src/screens/DefectReport';
import { SettingsContext, initialContext } from '../../src/SettingsProvider';

const mockUseQuery = jest.fn();

jest.mock('react-apollo', () => ({
  useQuery: (...args) => mockUseQuery(...args)
}));

jest.mock('../../src/components/index.js', () => {
  const { View } = require('react-native');

  return {
    DefaultKeyboardAvoidingView: ({ children }) => <View>{children}</View>,
    DefectReportCreateForm: () => <View />,
    DefectReportLocationForm: () => <View />,
    HtmlView: () => <View />,
    LoadingContainer: ({ children }) => <View>{children}</View>,
    SafeAreaViewFlex: ({ children }) => <View>{children}</View>,
    Wrapper: ({ children }) => <View>{children}</View>
  };
});

jest.mock('../../src/hooks', () => ({
  useStaticContent: jest.fn(() => ({
    data: undefined,
    loading: true,
    refetch: jest.fn()
  }))
}));

describe('DefectReportFormScreen', () => {
  const navigation = { goBack: jest.fn(), navigate: jest.fn() };
  const route = {};

  beforeEach(() => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      loading: true,
      refetch: jest.fn()
    });
  });

  it('fetches defect report categories from the network when opening the form', async () => {
    const globalSettings = {
      ...initialContext.globalSettings,
      settings: {
        defectReports: {
          categoryId: 123
        }
      }
    };

    await act(async () => {
      renderer.create(
        <NetworkContext.Provider value={{ isConnected: true, isMainserverUp: true }}>
          <SettingsContext.Provider value={{ ...initialContext, globalSettings }}>
            <DefectReportFormScreen navigation={navigation} route={route} />
          </SettingsContext.Provider>
        </NetworkContext.Provider>
      );
    });

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        variables: { ids: [123] },
        fetchPolicy: 'network-only',
        skip: false
      })
    );
  });
});
