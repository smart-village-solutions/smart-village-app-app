/* eslint-disable @typescript-eslint/no-var-requires, react/prop-types */
import React from 'react';
import { Platform } from 'react-native';
import renderer, { act } from 'react-test-renderer';

import { MultiImageSelector } from '../../src/components/selectors/MultiImageSelector';
import { texts } from '../../src/config';
import { onImageSelect } from '../../src/helpers/selectors';

const mockCaptureImage = jest.fn(async () => undefined);
const mockSelectImage = jest.fn(async () => undefined);

jest.mock('expo-location', () => ({ PermissionStatus: { GRANTED: 'granted' } }));
jest.mock('react-query', () => ({ useMutation: () => ({ mutateAsync: jest.fn() }) }));
jest.mock('../../src/hooks', () => ({
  useCaptureImage: () => ({ captureImage: mockCaptureImage }),
  useLastKnownPosition: () => ({ position: undefined }),
  usePosition: () => ({ position: undefined }),
  useReverseGeocode: () => jest.fn(),
  useSelectImage: () => ({ selectImage: mockSelectImage }),
  useSystemPermission: () => ({ status: 'granted' })
}));
jest.mock('../../src/helpers', () => ({
  jsonParser: (value: string) => JSON.parse(value),
  volunteerApiV1Url: 'https://example.com/'
}));
jest.mock('../../src/helpers/selectors', () => ({
  onDeleteImage: jest.fn(),
  onImageSelect: jest.fn(async ({ imageFunction }) => imageFunction())
}));
jest.mock('../../src/queries/volunteer', () => ({ deleteFile: jest.fn() }));
jest.mock('../../src/components/form', () => ({ Input: () => null }));
jest.mock('../../src/components/Image', () => ({ Image: () => null }));
jest.mock('../../src/components/Button', () => ({
  Button: (props) => require('react').createElement('mock-button', props)
}));
jest.mock('react-native-elements', () => ({
  Divider: () => null,
  // Keep the real app Modal. Android's native modal never emits onDismiss.
  Overlay: ({ children, ...props }) =>
    require('react').createElement('mock-overlay', props, props.isVisible ? children : null)
}));

describe('SUE native image picker handoff', () => {
  let tree: renderer.ReactTestRenderer;
  const saveDraft = jest.fn(async () => undefined);

  const renderSelector = async () => {
    await act(async () => {
      tree = renderer.create(
        <MultiImageSelector
          authToken={null}
          configuration={{ limitation: { maxCount: '3' } }}
          control={{}}
          coordinateCheck={undefined}
          errorType="image"
          field={{ name: 'images', onChange: jest.fn(), value: '[]' }}
          item={{ buttonTitle: 'Bilder hinzufügen' }}
          onBeforeNativeImagePicker={saveDraft}
          selectorType="Sue"
        />
      );
    });
  };

  const pressButton = async (title: string) => {
    await act(async () => {
      tree.root.findByProps({ title }).props.onPress();
    });
  };

  const overlay = () => tree.root.findByType('mock-overlay');

  beforeEach(() => {
    jest.clearAllMocks();
    jest.replaceProperty(Platform, 'OS', 'android');
  });

  afterEach(() => {
    if (tree) act(() => tree.unmount());
    jest.restoreAllMocks();
  });

  it.each([
    ['camera', texts.sue.report.alerts.imageSelectAlert.camera, mockCaptureImage],
    ['gallery', texts.sue.report.alerts.imageSelectAlert.gallery, mockSelectImage]
  ])(
    'opens the Android %s after hiding the chooser and saving the draft',
    async (_, title, picker) => {
      await renderSelector();
      expect(onImageSelect).not.toHaveBeenCalled();
      await pressButton('Bilder hinzufügen');
      expect(overlay().props.isVisible).toBe(true);
      expect(overlay().props.onDismiss).toBeUndefined();

      let finishSaving: () => void = () => undefined;
      saveDraft.mockImplementationOnce(
        () => new Promise<void>((resolve) => (finishSaving = resolve))
      );
      await pressButton(title as string);
      expect(overlay().props.isVisible).toBe(false);
      expect(saveDraft).toHaveBeenCalledTimes(1);
      expect(picker).not.toHaveBeenCalled();

      await act(async () => finishSaving());
      expect(picker).toHaveBeenCalledTimes(1);
      expect(onImageSelect).toHaveBeenCalledTimes(1);

      // Cancellation by the native picker must allow another selection.
      await pressButton('Bilder hinzufügen');
      await pressButton(title as string);
      expect(picker).toHaveBeenCalledTimes(2);
      expect(onImageSelect).toHaveBeenCalledTimes(2);
    }
  );

  it('does not launch a picker when the chooser is dismissed without a selection', async () => {
    await renderSelector();
    await pressButton('Bilder hinzufügen');
    await act(async () => overlay().props.onBackdropPress());

    expect(overlay().props.isVisible).toBe(false);
    expect(saveDraft).not.toHaveBeenCalled();
    expect(onImageSelect).not.toHaveBeenCalled();
  });

  it('still waits for native dismissal before opening the iOS picker', async () => {
    jest.replaceProperty(Platform, 'OS', 'ios');
    await renderSelector();
    await pressButton('Bilder hinzufügen');
    await pressButton(texts.sue.report.alerts.imageSelectAlert.gallery);

    expect(overlay().props.isVisible).toBe(false);
    expect(saveDraft).not.toHaveBeenCalled();
    expect(mockSelectImage).not.toHaveBeenCalled();

    await act(async () => overlay().props.onDismiss());
    expect(saveDraft).toHaveBeenCalledTimes(1);
    expect(mockSelectImage).toHaveBeenCalledTimes(1);
  });
});
