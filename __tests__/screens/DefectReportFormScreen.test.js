/* eslint-disable @typescript-eslint/no-var-requires, react/prop-types */
import React from 'react';
import renderer, { act } from 'react-test-renderer';

import { NetworkContext } from '../../src/NetworkProvider';
import { DefectReportFormScreen } from '../../src/screens/DefectReport';
import { SettingsContext, initialContext } from '../../src/SettingsProvider';

const mockUseQuery = jest.fn();
const mockUseStaticContent = jest.fn();
const mockScrollTo = jest.fn();

jest.mock('react-apollo', () => ({
  useQuery: (...args) => mockUseQuery(...args)
}));

jest.mock('react-native-keyboard-controller', () => {
  const React = require('react');
  const { ScrollView } = require('react-native');
  return {
    KeyboardProvider: ({ children }) => children,
    KeyboardAwareScrollView: React.forwardRef((props, ref) => {
      React.useImperativeHandle(ref, () => ({ scrollTo: mockScrollTo }));
      return <ScrollView testID="aware-scroll" {...props} />;
    })
  };
});

jest.mock('../../src/components/index.js', () => {
  const { View, Button } = require('react-native');

  return {
    DefaultKeyboardAvoidingView: ({ children }) => <View>{children}</View>,
    DefectReportCreateForm: ({ onCategorySearchBlur, onCategorySearchFocus }) => (
      <View
        testID="category-search"
        onBlur={onCategorySearchBlur}
        onFocus={onCategorySearchFocus}
      />
    ),
    DefectReportLocationForm: ({
      setIsLocationSelect,
      withoutLocation,
      showMap,
      setShowMap,
      setSelectedPosition,
      selectedPosition
    }) => (
      <View testID={`location-form-${withoutLocation}`}>
        <Button title="Continue" onPress={() => setIsLocationSelect(false)} />
        <Button title="Open map" onPress={() => setShowMap(true)} />
        {showMap && (
          <View testID="map" selectedPosition={selectedPosition}>
            <Button
              title="Set pin"
              onPress={() => setSelectedPosition({ latitude: 54.78, longitude: 9.43 })}
            />
          </View>
        )}
      </View>
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
    mockScrollTo.mockClear();
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

  it('scrolls the category search below the header while the keyboard is focused', async () => {
    mockUseStaticContent.mockReturnValue({ loading: false });
    mockUseQuery.mockReturnValue({ loading: false });
    let component;

    await act(async () => {
      component = renderer.create(<DefectReportFormScreen navigation={navigation} route={route} />);
    });
    await act(async () => {
      component.root.findByProps({ title: 'Continue' }).props.onPress();
    });
    await act(async () => {
      component.root.findByProps({ testID: 'category-search' }).props.onFocus(600);
    });

    expect(mockScrollTo).toHaveBeenCalledWith({ y: 592, animated: true });
    expect(component.root.findByProps({ testID: 'aware-scroll' }).props.bottomOffset).toBe(8);

    await act(async () => {
      component.root.findByProps({ testID: 'category-search' }).props.onBlur();
    });
    expect(component.root.findByProps({ testID: 'aware-scroll' }).props.bottomOffset).toBe(120);
  });

  it('preserves the open map and selected pin when loading temporarily remounts the location form', async () => {
    mockUseStaticContent.mockReturnValue({ loading: false });
    mockUseQuery.mockReturnValue({ loading: false });
    let component;
    const screen = () => <DefectReportFormScreen navigation={navigation} route={route} />;

    await act(async () => {
      component = renderer.create(screen());
    });
    await act(async () => {
      component.root.findByProps({ title: 'Open map' }).props.onPress();
    });
    await act(async () => {
      component.root.findByProps({ title: 'Set pin' }).props.onPress();
    });

    mockUseQuery.mockReturnValue({ loading: true });
    await act(async () => {
      component.update(screen());
    });
    expect(component.root.findAllByProps({ testID: 'map' })).toHaveLength(0);

    mockUseQuery.mockReturnValue({ loading: false });
    await act(async () => {
      component.update(screen());
    });
    expect(component.root.findByProps({ testID: 'map' }).props.selectedPosition).toEqual({
      latitude: 54.78,
      longitude: 9.43
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
