import * as Updates from 'expo-updates';
import React from 'react';
import { AppState } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import renderer, { act } from 'react-test-renderer';

jest.mock('../../src/components/OtaUpdateBanner', () => {
  const React = jest.requireActual('react');
  const ReactNative = jest.requireActual('react-native');
  const PropTypes = jest.requireActual('prop-types');

  const MockOtaUpdateBanner = ({ onDismiss, onPress, visible }) =>
    visible ? (
      <ReactNative.View>
        <ReactNative.TouchableOpacity onPress={onDismiss} testID="ota-update-dismiss" />
        <ReactNative.TouchableOpacity onPress={onPress} testID="ota-update-action" />
      </ReactNative.View>
    ) : null;

  MockOtaUpdateBanner.propTypes = {
    onDismiss: PropTypes.func,
    onPress: PropTypes.func,
    visible: PropTypes.bool
  };

  return {
    OtaUpdateBanner: MockOtaUpdateBanner
  };
});

import { OtaUpdateManager } from '../../src/components/OtaUpdateManager';

describe('OtaUpdateManager', () => {
  let appStateListener;
  let appStateSubscription;
  let originalDevFlag;
  let consoleErrorSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    appStateSubscription = { remove: jest.fn() };
    appStateListener = undefined;
    originalDevFlag = __DEV__;
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    global.__DEV__ = false;

    jest.spyOn(AppState, 'addEventListener').mockImplementation((_, listener) => {
      appStateListener = listener;
      return appStateSubscription;
    });
  });

  afterEach(() => {
    global.__DEV__ = originalDevFlag;
    consoleErrorSpy.mockRestore();
    jest.restoreAllMocks();
  });

  const renderComponent = async () => {
    let component;

    await act(async () => {
      component = renderer.create(
        <SafeAreaProvider
          initialMetrics={{
            frame: { height: 640, width: 320, x: 0, y: 0 },
            insets: { bottom: 0, left: 0, right: 0, top: 0 }
          }}
        >
          <OtaUpdateManager />
        </SafeAreaProvider>
      );

      await Promise.resolve();
      await Promise.resolve();
    });

    return component;
  };

  it('shows the banner after a successful ota download and reloads on action', async () => {
    Updates.checkForUpdateAsync.mockResolvedValue({ isAvailable: true });
    Updates.fetchUpdateAsync.mockResolvedValue({});

    const component = await renderComponent();
    const bannerAction = component.root.findByProps({ testID: 'ota-update-action' });

    expect(Updates.checkForUpdateAsync).toHaveBeenCalledTimes(1);
    expect(Updates.fetchUpdateAsync).toHaveBeenCalledTimes(1);
    expect(bannerAction).toBeTruthy();

    await act(async () => {
      await bannerAction.props.onPress();
    });

    expect(Updates.reloadAsync).toHaveBeenCalledTimes(1);
  });

  it('shows the banner again after dismiss when the app returns to foreground', async () => {
    Updates.checkForUpdateAsync.mockResolvedValue({ isAvailable: true });
    Updates.fetchUpdateAsync.mockResolvedValue({});

    const component = await renderComponent();

    await act(async () => {
      component.root.findByProps({ testID: 'ota-update-dismiss' }).props.onPress();
    });

    expect(() => component.root.findByProps({ testID: 'ota-update-action' })).toThrow();

    await act(async () => {
      appStateListener('background');
      appStateListener('active');
    });

    expect(component.root.findByProps({ testID: 'ota-update-action' })).toBeTruthy();
    expect(Updates.fetchUpdateAsync).toHaveBeenCalledTimes(1);
  });

  it('shows the banner again when reloadAsync fails', async () => {
    Updates.checkForUpdateAsync.mockResolvedValue({ isAvailable: true });
    Updates.fetchUpdateAsync.mockResolvedValue({});
    Updates.reloadAsync.mockRejectedValue(new Error('reload failed'));

    const component = await renderComponent();

    await act(async () => {
      await component.root.findByProps({ testID: 'ota-update-action' }).props.onPress();
    });

    expect(Updates.reloadAsync).toHaveBeenCalledTimes(1);
    expect(component.root.findByProps({ testID: 'ota-update-action' })).toBeTruthy();
  });
});
