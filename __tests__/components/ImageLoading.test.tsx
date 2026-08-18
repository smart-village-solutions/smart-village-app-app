/* eslint-disable @typescript-eslint/no-var-requires */
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { ActivityIndicator, Text } from 'react-native';

import { Image } from '../../src/components/Image';

jest.mock('expo-image', () => {
  const ReactLocal = require('react');
  const { View: MockView } = require('react-native');

  return {
    Image: (props: object) => ReactLocal.createElement(MockView, { ...props, testID: 'expo-image' })
  };
});
jest.mock('../../src/components/ImageButton', () => ({ ImageButton: () => null }));
jest.mock('../../src/components/ImageMessage', () => ({ ImageMessage: () => null }));
jest.mock('../../src/components/ImageRights', () => ({ ImageRights: () => null }));
jest.mock('../../src/AccessibilityProvider', () => {
  const ReactLocal = require('react');

  return {
    AccessibilityContext: ReactLocal.createContext({ isGrayscaleEnabled: false })
  };
});
jest.mock('../../src/ConfigurationsProvider', () => {
  const ReactLocal = require('react');

  return {
    ConfigurationsContext: ReactLocal.createContext({ sueConfig: {} })
  };
});
jest.mock('../../src/helpers', () => ({
  imageHeight: () => 100,
  imageWidth: () => 100
}));

describe('Image loading states', () => {
  it('honors an explicitly empty loading placeholder', () => {
    const { UNSAFE_queryByType } = render(
      <Image PlaceholderContent={null} source={{ uri: 'https://example.com/icon.png' }} />
    );

    expect(UNSAFE_queryByType(ActivityIndicator)).toBeNull();
  });

  it('renders fallback content instead of loading forever when the source URI is empty', async () => {
    const { getByText, UNSAFE_queryByType } = render(
      <Image
        FallbackContent={<Text>fallback image</Text>}
        PlaceholderContent={null}
        source={{ uri: '' }}
      />
    );

    await waitFor(() => expect(getByText('fallback image')).toBeTruthy());
    expect(UNSAFE_queryByType(ActivityIndicator)).toBeNull();
  });

  it('renders fallback content after the image loader reports an error', async () => {
    const { getByTestId, getByText } = render(
      <Image
        FallbackContent={<Text>fallback image</Text>}
        PlaceholderContent={null}
        source={{ uri: 'https://example.com/icon.png' }}
      />
    );

    fireEvent(getByTestId('expo-image'), 'error');

    await waitFor(() => expect(getByText('fallback image')).toBeTruthy());
  });

  it('clears a previous error when the image source changes', async () => {
    const fallback = <Text>fallback image</Text>;
    const { getByTestId, getByText, queryByText, rerender } = render(
      <Image
        FallbackContent={fallback}
        PlaceholderContent={null}
        source={{ uri: 'https://example.com/broken.png' }}
      />
    );

    fireEvent(getByTestId('expo-image'), 'error');
    await waitFor(() => expect(getByText('fallback image')).toBeTruthy());

    rerender(
      <Image
        FallbackContent={fallback}
        PlaceholderContent={null}
        source={{ uri: 'https://example.com/valid.png' }}
      />
    );

    expect(queryByText('fallback image')).toBeNull();
  });
});
