/* eslint-disable @typescript-eslint/no-var-requires, react/prop-types */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { AppState } from 'react-native';

import { ConfigurationsContext } from '../../src/ConfigurationsProvider';
import { SueReportDescription, SueReportProgress } from '../../src/components';
import { readSueReportDraft, storeSueReportDraft } from '../../src/helpers/sueReportDraftHelper';
import { SueReportScreen } from '../../src/screens/SUE/SueReportScreen';

const mockScrollTo = jest.fn();
const mockRefetch = jest.fn();
let mockAreaLoading = true;
const mockSetValue = jest.fn();
const mockGetValues = jest.fn();
let mockValues: Record<string, unknown>;
const fieldKeys = {
  CITY: 'city',
  DESCRIPTION: 'description',
  EMAIL: 'email',
  FIRST_NAME: 'name',
  HOUSE_NUMBER: 'houseNumber',
  IMAGES: 'images',
  LAST_NAME: 'familyName',
  PHONE: 'phone',
  POSTAL_CODE: 'postalCode',
  STREET: 'street',
  TERMS_OF_SERVICE: 'termsOfService',
  TITLE: 'title'
};

jest.mock('react-native', () => {
  const original = jest.requireActual('react-native');
  const ReactLocal = require('react');
  return {
    ActivityIndicator: original.ActivityIndicator,
    Alert: original.Alert,
    AppState: original.AppState,
    Keyboard: original.Keyboard,
    View: original.View,
    ScrollView: ReactLocal.forwardRef(({ children, ...props }, ref) => {
      ReactLocal.useImperativeHandle(ref, () => ({ scrollTo: mockScrollTo }));
      return ReactLocal.createElement('mock-scroll-view', props, children);
    })
  };
});
jest.mock('expo-screen-orientation', () => ({ OrientationLock: {}, lockAsync: jest.fn() }));
jest.mock('../../src/ConfigurationsProvider', () => ({
  ConfigurationsContext: require('react').createContext({})
}));
jest.mock('../../src/components', () => {
  const ReactLocal = require('react');
  const component =
    (name: string) =>
    ({ children, ...props }) =>
      ReactLocal.createElement(name, props, children);
  return Object.fromEntries(
    [
      'BoldText',
      'Button',
      'DefaultKeyboardAvoidingView',
      'HeaderRight',
      'HtmlView',
      'LoadingContainer',
      'SafeAreaViewFlex',
      'SueReportDescription',
      'SueReportLocation',
      'SueReportProgress',
      'SueReportSend',
      'SueReportServices',
      'SueReportUser',
      'Wrapper'
    ].map((name) => [name, component(name)])
  );
});
jest.mock('../../src/config', () => ({
  SUE_REPORT_VALUES: 'sueReportValues',
  consts: {
    INPUT_KEYS: {
      SUE: {
        CITY: 'city',
        DESCRIPTION: 'description',
        EMAIL: 'email',
        FIRST_NAME: 'name',
        HOUSE_NUMBER: 'houseNumber',
        IMAGES: 'images',
        LAST_NAME: 'familyName',
        PHONE: 'phone',
        POSTAL_CODE: 'postalCode',
        STREET: 'street',
        TERMS_OF_SERVICE: 'termsOfService',
        TITLE: 'title'
      }
    }
  },
  device: { width: 390 },
  normalize: (value: number) => value,
  texts: {
    sue: {
      report: {
        next: 'Next',
        retry: 'Retry',
        draftRestoreError: 'Draft could not be loaded',
        back: 'Back',
        alerts: { limitOfArea: () => '', hint: 'Hint' }
      }
    },
    defectReport: { alerts: { error: 'Error' } }
  }
}));
jest.mock('../../src/helpers', () => ({
  getSueLimitOfAreaCity: () => ''
}));
jest.mock('../../src/helpers/sueReportDraftHelper', () => ({
  storeSueReportDraft: jest.fn(async () => undefined),
  readSueReportDraft: jest.fn()
}));
jest.mock('../../src/helpers/sueReportStorageHelper', () => ({ updateSueMyReports: jest.fn() }));
jest.mock('../../src/hooks', () => ({ useKeyboardHeight: () => 0 }));
jest.mock('../../src/hooks/useTheme', () => ({ useTheme: () => ({ colors: {} }) }));
jest.mock('../../src/hooks/useThemeStyles', () => ({
  useThemeStyles: (createStyles) => createStyles()
}));
jest.mock('../../src/queries', () => ({ QUERY_TYPES: { SUE: {} }, getQuery: jest.fn() }));
jest.mock('../../src/queries/SUE', () => ({ postRequests: jest.fn() }));
jest.mock('react-native-elements', () => ({ Divider: () => null }));
jest.mock('react-query', () => ({
  useQuery: () => ({ isLoading: mockAreaLoading }),
  useMutation: () => ({ mutateAsync: jest.fn() })
}));
jest.mock('react-hook-form', () => ({
  useForm: () => ({
    control: {},
    formState: {},
    getValues: mockGetValues,
    setValue: mockSetValue,
    reset: jest.fn(),
    handleSubmit: jest.fn()
  })
}));

const draft = {
  currentProgress: 1,
  title: 'Overflowing bin',
  description: 'At the bus stop',
  images: '[{"uri":"file:///photo.jpg"}]',
  service: { serviceCode: '123', serviceName: 'Waste' },
  selectedPosition: { latitude: 54, longitude: 10 }
};
const navigation = {
  addListener: () => jest.fn(),
  setOptions: jest.fn(),
  getState: () => ({ key: 'report-stack' }),
  getParent: () => ({
    getState: () => ({ routes: [{ name: 'Stack2', state: { key: 'report-stack' } }] })
  })
};
const progress = ['category', 'description', 'location', 'user'].map((content) => ({
  content,
  inputs: []
}));
const renderScreen = (steps = progress) => (
  <ConfigurationsContext.Provider
    value={{ refetch: mockRefetch, sueConfig: { sueProgress: steps } } as never}
  >
    <SueReportScreen
      navigation={navigation as never}
      route={{ name: 'SueReport', key: 'report' } as never}
    />
  </ConfigurationsContext.Provider>
);
let tree: renderer.ReactTestRenderer;
beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(AppState, 'addEventListener').mockReturnValue({ remove: jest.fn() });
  mockAreaLoading = true;
  mockValues = Object.fromEntries(Object.values(fieldKeys).map((key) => [key, '']));
  mockGetValues.mockImplementation((key?: string) => (key ? mockValues[key] : mockValues));
  mockSetValue.mockImplementation((key: string, value: unknown) => {
    mockValues[key] = value;
  });
  (readSueReportDraft as jest.Mock).mockResolvedValue(draft);
});
afterEach(() => {
  if (tree) act(() => tree.unmount());
  jest.restoreAllMocks();
});

it('restores all fields and the saved step after configuration and area data arrive', async () => {
  await act(async () => {
    tree = renderer.create(renderScreen([]));
  });
  expect(readSueReportDraft).not.toHaveBeenCalled();
  await act(async () => tree.update(renderScreen([{ content: '', inputs: [] }])));
  expect(readSueReportDraft).not.toHaveBeenCalled();
  await act(async () => tree.update(renderScreen()));
  expect(mockValues).toMatchObject({
    title: draft.title,
    description: draft.description,
    images: draft.images
  });
  expect(mockScrollTo).not.toHaveBeenCalled();
  expect(storeSueReportDraft).not.toHaveBeenCalled();

  mockAreaLoading = false;
  await act(async () => tree.update(renderScreen()));
  await act(async () => tree.root.findByProps({ horizontal: true }).props.onContentSizeChange(390));
  expect(mockScrollTo).not.toHaveBeenCalled();
  await act(async () =>
    tree.root.findByProps({ horizontal: true }).props.onContentSizeChange(1560)
  );
  expect(tree.root.findByType(SueReportProgress).props.currentProgress).toBe(2);
  expect(mockScrollTo).toHaveBeenCalledWith({ x: 390, y: 0, animated: false });
  const description = tree.root.findByType(SueReportDescription);
  expect(description.props.selectedPosition).toEqual(draft.selectedPosition);
});

it('stores current fields and step for recovery within the same app session', async () => {
  mockAreaLoading = false;
  await act(async () => {
    tree = renderer.create(renderScreen());
  });
  mockValues.title = 'Edited before settings';
  await act(async () => tree.root.findByType(SueReportDescription).props.storeReportValues());
  expect(storeSueReportDraft).toHaveBeenLastCalledWith(
    expect.objectContaining({
      title: 'Edited before settings',
      currentProgress: 1,
      service: draft.service,
      selectedPosition: draft.selectedPosition
    })
  );
});

it('preserves a recoverable draft on storage failure and allows retry before editing', async () => {
  mockAreaLoading = false;
  (readSueReportDraft as jest.Mock).mockRejectedValueOnce(new Error('Temporarily unavailable'));
  await act(async () => {
    tree = renderer.create(renderScreen());
  });
  expect(tree.root.findAllByType(SueReportDescription)).toHaveLength(0);
  expect(storeSueReportDraft).not.toHaveBeenCalled();
  await act(async () => tree.root.findByProps({ title: 'Retry' }).props.onPress());
  expect(tree.root.findByType(SueReportProgress).props.currentProgress).toBe(2);
  expect(mockValues.title).toBe(draft.title);
});

it('keeps the current form and step on a warm Settings return and configuration refresh', async () => {
  mockAreaLoading = false;
  await act(async () => {
    tree = renderer.create(renderScreen());
  });
  mockValues.title = 'Edited before settings';
  await act(async () => tree.root.findByType(SueReportDescription).props.storeReportValues());

  const subscriptions = (AppState.addEventListener as jest.Mock).mock.calls;
  for (const state of ['inactive', 'background', 'active']) {
    await act(async () => {
      subscriptions.forEach(([event, callback]) => {
        if (event === 'change') callback(state);
      });
      tree.update(renderScreen([...progress]));
    });
  }

  expect(mockValues).toMatchObject({
    title: 'Edited before settings',
    description: draft.description,
    images: draft.images
  });
  expect(tree.root.findByType(SueReportProgress).props.currentProgress).toBe(2);
  expect(readSueReportDraft).toHaveBeenCalledTimes(1);
  expect(storeSueReportDraft).toHaveBeenCalledTimes(1);
});
