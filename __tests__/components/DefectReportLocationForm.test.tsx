/* eslint-disable @typescript-eslint/no-var-requires, react/prop-types */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import * as Location from 'expo-location';

import { DefectReportLocationForm } from '../../src/components/defectReport/DefectReportLocationForm';

const mockSetAndSyncLocationSettings = jest.fn().mockResolvedValue(undefined);

jest.mock('../../src/hooks', () => ({
  useLocationSettings: () => ({
    locationSettings: {},
    setAndSyncLocationSettings: mockSetAndSyncLocationSettings
  })
}));

jest.mock('expo-location', () => ({
  Accuracy: { Balanced: 3 },
  PermissionStatus: { GRANTED: 'granted', DENIED: 'denied' },
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  getLastKnownPositionAsync: jest.fn()
}));

jest.mock('../../src/components/Button', () => {
  const React = require('react');
  const { Button } = require('react-native');
  return { Button: ({ title, onPress }) => React.createElement(Button, { title, onPress }) };
});

jest.mock('../../src/components/LoadingSpinner', () => {
  const React = require('react');
  const { View } = require('react-native');
  return { LoadingSpinner: () => React.createElement(View, { testID: 'loading' }) };
});

jest.mock('../../src/components/map', () => {
  const React = require('react');
  const { View } = require('react-native');
  return { MapLibre: () => React.createElement(View, { testID: 'map' }) };
});
jest.mock('../../src/components/Text', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return { RegularText: ({ children }) => React.createElement(Text, null, children) };
});
jest.mock('../../src/components/Touchable', () => {
  const React = require('react');
  const { View } = require('react-native');
  return { Touchable: ({ children }) => React.createElement(View, null, children) };
});
jest.mock('../../src/components/Wrapper', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    WrapperHorizontal: ({ children }) => React.createElement(View, null, children),
    WrapperVertical: ({ children }) => React.createElement(View, null, children)
  };
});
jest.mock('react-native-collapsible', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: ({ children, collapsed }) =>
      collapsed ? null : React.createElement(View, null, children)
  };
});

const permission = jest.mocked(Location.requestForegroundPermissionsAsync);
const currentPosition = jest.mocked(Location.getCurrentPositionAsync);
const lastKnownPosition = jest.mocked(Location.getLastKnownPositionAsync);

const props = () => ({
  setIsLocationSelect: jest.fn(),
  selectedPosition: undefined,
  setSelectedPosition: jest.fn(),
  showMap: false,
  setShowMap: jest.fn()
});

describe('DefectReportLocationForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    permission.mockResolvedValue({ status: Location.PermissionStatus.GRANTED } as never);
    currentPosition.mockResolvedValue({ coords: { latitude: 54.78, longitude: 9.43 } } as never);
    lastKnownPosition.mockResolvedValue(null);
  });

  it('continues with the current position', async () => {
    const callbacks = props();
    let tree: renderer.ReactTestRenderer;

    await act(async () => {
      tree = renderer.create(<DefectReportLocationForm {...callbacks} />);
    });
    await act(async () => {
      tree.root.findByProps({ title: 'Meine aktuelle Position verwenden' }).props.onPress();
    });

    expect(callbacks.setSelectedPosition).toHaveBeenCalledWith({
      latitude: 54.78,
      longitude: 9.43
    });
    expect(callbacks.setIsLocationSelect).toHaveBeenCalledWith(false);
    expect(lastKnownPosition).not.toHaveBeenCalled();
  });

  it('accepts a current position that arrives after six seconds', async () => {
    jest.useFakeTimers();
    currentPosition.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(
            () => resolve({ coords: { latitude: 54.78, longitude: 9.43 } } as never),
            8000
          );
        })
    );
    const callbacks = props();
    let tree: renderer.ReactTestRenderer;

    try {
      await act(async () => {
        tree = renderer.create(<DefectReportLocationForm {...callbacks} />);
      });
      await act(async () => {
        tree.root.findByProps({ title: 'Meine aktuelle Position verwenden' }).props.onPress();
      });
      await act(async () => {
        jest.advanceTimersByTime(8000);
      });

      expect(callbacks.setIsLocationSelect).toHaveBeenCalledWith(false);
      expect(lastKnownPosition).not.toHaveBeenCalled();
    } finally {
      jest.useRealTimers();
    }
  });

  it('returns to the choices when no current or last known position is available', async () => {
    currentPosition.mockRejectedValue(new Error('GPS unavailable'));
    const callbacks = props();
    let tree: renderer.ReactTestRenderer;
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    await act(async () => {
      tree = renderer.create(<DefectReportLocationForm {...callbacks} />);
    });
    await act(async () => {
      tree.root.findByProps({ title: 'Meine aktuelle Position verwenden' }).props.onPress();
    });

    expect(tree.root.findAllByProps({ testID: 'loading' })).toHaveLength(0);
    expect(tree.root.findByProps({ title: 'Auf der Karte auswählen' })).toBeTruthy();
    expect(lastKnownPosition).toHaveBeenCalledWith({ maxAge: 60000 });
    expect(callbacks.setIsLocationSelect).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it('allows map selection after location permission is denied', async () => {
    permission.mockResolvedValue({ status: Location.PermissionStatus.DENIED } as never);
    const callbacks = props();
    let tree: renderer.ReactTestRenderer;

    await act(async () => {
      tree = renderer.create(<DefectReportLocationForm {...callbacks} />);
    });
    await act(async () => {
      tree.root.findByProps({ title: 'Meine aktuelle Position verwenden' }).props.onPress();
    });

    expect(tree.root.findAllByProps({ testID: 'loading' })).toHaveLength(0);
    expect(tree.root.findByProps({ title: 'Auf der Karte auswählen' })).toBeTruthy();
    expect(currentPosition).not.toHaveBeenCalled();
    expect(mockSetAndSyncLocationSettings).toHaveBeenCalledWith({ locationService: false });
  });
});
