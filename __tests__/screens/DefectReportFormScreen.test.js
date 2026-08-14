/* eslint-disable @typescript-eslint/no-var-requires, react/prop-types */
import React from 'react';
import renderer, { act } from 'react-test-renderer';

import { NetworkContext } from '../../src/NetworkProvider';
import { DefectReportFormScreen } from '../../src/screens/DefectReport';
import { SettingsContext, initialContext } from '../../src/SettingsProvider';

const mockUseQuery = jest.fn();
const mockUseStaticContent = jest.fn();

jest.mock('react-apollo', () => ({
  useQuery: (...args) => mockUseQuery(...args)
}));

jest.mock('../../src/components/index.js', () => {
  const { View } = require('react-native');

  return {
    DefaultKeyboardAvoidingView: ({ children }) => <View>{children}</View>,
    DefectReportCreateForm: () => <View />,
    DefectReportLocationForm: ({ withoutLocation }) => (
      <View testID={`location-form-${withoutLocation}`} />
    ),
    HtmlView: () => <View />,
    LoadingContainer: ({ children }) => <View>{children}</View>,
    SafeAreaViewFlex: ({ children }) => <View>{children}</View>,
    Wrapper: ({ children }) => <View>{children}</View>
  };
});

jest.mock('../../src/hooks', () => ({
  useStaticContent: (...args) => mockUseStaticContent(...args)
}));

describe('DefectReportFormScreen', () => {
  const navigation = { goBack: jest.fn(), navigate: jest.fn() };
  const route = {};

  beforeEach(() => {
    mockUseStaticContent.mockReturnValue({
      data: undefined,
      loading: true,
      refetch: jest.fn()
    });
    mockUseQuery.mockReturnValue({
      data: undefined,
      loading: true,
      refetch: jest.fn()
    });
  });

  it.each([
    [true, true],
    [undefined, false]
  ])(
    'passes withoutLocation=%s from global settings to the location form',
    async (setting, expected) => {
      mockUseStaticContent.mockReturnValue({
        data: undefined,
        loading: false,
        refetch: jest.fn()
      });
      mockUseQuery.mockReturnValue({
        data: undefined,
        loading: false,
        refetch: jest.fn()
      });

      const globalSettings = {
        ...initialContext.globalSettings,
        settings: {
          defectReports: {
            withoutLocation: setting
          }
        }
      };
      let component;

      await act(async () => {
        component = renderer.create(
          <NetworkContext.Provider value={{ isConnected: true, isMainserverUp: true }}>
            <SettingsContext.Provider value={{ ...initialContext, globalSettings }}>
              <DefectReportFormScreen navigation={navigation} route={route} />
            </SettingsContext.Provider>
          </NetworkContext.Provider>
        );
      });

      expect(component.root.findByProps({ testID: `location-form-${expected}` })).toBeTruthy();
    }
  );

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
