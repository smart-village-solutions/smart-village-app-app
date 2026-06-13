import React from 'react';
import renderer, { act } from 'react-test-renderer';

import { MultiImageSelector } from '../../src/components/selectors/MultiImageSelector';

jest.mock('expo-location', () => ({
  PermissionStatus: {
    GRANTED: 'granted'
  }
}));

jest.mock('react-query', () => ({
  useMutation: () => ({ mutateAsync: jest.fn() })
}));

jest.mock('../../src/hooks', () => ({
  useCaptureImage: () => ({ captureImage: jest.fn() }),
  useLastKnownPosition: () => ({ position: undefined }),
  usePosition: () => ({ position: undefined }),
  useReverseGeocode: () => jest.fn(),
  useSelectImage: () => ({ selectImage: jest.fn() }),
  useSystemPermission: () => ({ status: 'granted' })
}));

jest.mock('../../src/helpers', () => ({
  jsonParser: (value: string) => JSON.parse(value),
  volunteerApiV1Url: 'https://example.com/',
  onDeleteImage: jest.fn(),
  onImageSelect: jest.fn()
}));

jest.mock('../../src/helpers/selectors', () => ({
  onDeleteImage: jest.fn(),
  onImageSelect: jest.fn()
}));

jest.mock('../../src/queries/volunteer', () => ({
  deleteFile: jest.fn()
}));

jest.mock('../../src/components/form', () => ({
  Input: () => null
}));

jest.mock('../../src/components/Image', () => ({
  Image: () => null
}));

describe('MultiImageSelector key warnings', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('renders multiple image error texts without React key warnings', () => {
    let tree: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <MultiImageSelector
          authToken={null}
          configuration={{ limitation: { maxCount: '3' } }}
          control={{}}
          coordinateCheck={undefined}
          errorType="image"
          field={{
            name: 'images',
            onChange: jest.fn(),
            value: JSON.stringify([
              { errorText: 'first image error', uri: 'file:///first.jpg' },
              { errorText: 'second image error', uri: 'file:///second.jpg' }
            ])
          }}
          item={{ buttonTitle: 'Add image', infoText: 'Upload images' }}
          selectorType="Sue"
        />
      );
    });

    const keyWarnings = consoleErrorSpy.mock.calls.filter(([message]) =>
      String(message).includes('Each child in a list should have a unique "key" prop')
    );

    expect(keyWarnings).toHaveLength(0);

    act(() => {
      tree!.unmount();
    });
  });
});
