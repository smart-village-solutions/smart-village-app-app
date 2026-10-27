import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import { Alert } from 'react-native';
import renderer from 'react-test-renderer';

import { ConfigurationsContext } from '../../src/ConfigurationsProvider';
import { readFromStore } from '../../src/helpers';
import { enqueueSueReport, readSueOutbox } from '../../src/helpers/sueReportStorage';
import { syncSueOutbox } from '../../src/helpers/sueReportSync';
import { SueReportScreen } from '../../src/screens/SUE/SueReportScreen';

const mockValues: Record<string, unknown> = {
  title: 'Test report',
  images: '[]',
  phone: '',
  description: 'Description'
};
const mockGetValues = (key?: string) => (key ? mockValues[key] : mockValues);
const mockSetValue = jest.fn();
const mockReset = jest.fn();
jest.mock('react-hook-form', () => ({
  useForm: () => ({
    control: {},
    formState: { errors: {} },
    getValues: mockGetValues,
    setValue: mockSetValue,
    reset: mockReset,
    handleSubmit: (submit: (data: unknown) => void) => () => submit(mockValues)
  })
}));
jest.mock('react-query', () => ({ useQuery: () => ({ isLoading: false }) }));
jest.mock('../../src/ConfigurationsProvider', () => ({
  ConfigurationsContext: jest.requireActual('react').createContext({
    refetch: jest.fn(),
    sueConfig: { sueProgress: [{ content: 'category', inputs: [], requiredInputs: [] }] }
  })
}));
jest.mock('../../src/components', () => {
  const ReactLocal = jest.requireActual('react');
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
    ].map((name) => [name, (props: object) => ReactLocal.createElement(`mock-${name}`, props)])
  );
});
jest.mock('react-native-elements', () => ({ Divider: () => null }));
jest.mock('../../src/config', () => ({
  ...jest.requireActual('../../src/config/sue'),
  ...jest.requireActual('../../src/config/texts'),
  ...jest.requireActual('../../src/config/consts'),
  device: { width: 390, platform: 'ios' },
  normalize: (value: number) => value
}));
jest.mock('../../src/helpers', () => ({
  ...jest.requireActual('../../src/helpers/sueHelper'),
  addToStore: jest.fn().mockResolvedValue(undefined),
  readFromStore: jest.fn(),
  formatSizeStandard: jest.fn()
}));
jest.mock('../../src/helpers/sueHelper', () => ({
  ...jest.requireActual('../../src/helpers/sueHelper'),
  fetchSueEndpoints: jest
    .fn()
    .mockResolvedValue({ apiKey: 'test-key', suePostRequest: 'https://example.test/requests' })
}));
jest.mock('../../src/helpers/sueReportStorage', () => ({
  enqueueSueReport: jest.fn(),
  readSueOutbox: jest.fn()
}));
jest.mock('../../src/helpers/sueReportSync', () => ({
  syncSueOutbox: jest.fn().mockResolvedValue(undefined)
}));
jest.mock('../../src/hooks', () => ({ useKeyboardHeight: () => 0 }));
jest.mock('../../src/hooks/useTheme', () => ({ useTheme: () => ({ colors: {} }) }));
jest.mock('../../src/hooks/useThemeStyles', () => ({ useThemeStyles: () => ({}) }));
jest.mock('../../src/queries', () => ({
  ...jest.requireActual('../../src/queries/types'),
  getQuery: jest.fn()
}));

const mount = async (sueConfig?: Record<string, unknown>) => {
  let tree: renderer.ReactTestRenderer;
  await renderer.act(async () => {
    const screen = (
      <SueReportScreen
        navigation={{ setOptions: jest.fn(), addListener: () => jest.fn() }}
        route={{ params: {} }}
      />
    );
    tree = renderer.create(
      sueConfig ? (
        <ConfigurationsContext.Provider value={{ refetch: jest.fn(), sueConfig } as never}>
          {screen}
        </ConfigurationsContext.Provider>
      ) : (
        screen
      )
    );
  });
  return tree!;
};

beforeEach(() => {
  jest.clearAllMocks();
  (readFromStore as jest.Mock).mockResolvedValue({
    service: { serviceCode: 'waste', serviceName: 'Waste' },
    clientSubmissionId: 'existing-draft-id'
  });
  (enqueueSueReport as jest.Mock).mockImplementation(async (entry) => entry);
  (readSueOutbox as jest.Mock).mockResolvedValue([
    { localId: 'existing-draft-id', deliveryStatus: 'sent', serviceRequestId: 38326 }
  ]);
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

it('restores a legacy draft without automatically submitting it', async () => {
  const tree = await mount();
  expect(enqueueSueReport).not.toHaveBeenCalled();
  expect(syncSueOutbox).not.toHaveBeenCalled();
  expect(AsyncStorage.removeItem).not.toHaveBeenCalled();
  renderer.act(() => tree.unmount());
});

it('does not mutate cached form steps while required fields are still loading', async () => {
  const progress = [{ content: 'user', inputs: ['firstName'], requiredInputs: ['firstName'] }];
  const tree = await mount({ sueProgress: progress, requiredFields: {} });
  expect(progress[0].requiredInputs).toEqual(['firstName']);
  renderer.act(() => tree.unmount());
});

it('queues once before clearing the draft and presents confirmed delivery', async () => {
  const tree = await mount();
  const submit = tree.root.findByType('mock-Button').props.onPress;
  await renderer.act(async () => {
    await Promise.all([submit(), submit()]);
  });
  expect(enqueueSueReport).toHaveBeenCalledTimes(1);
  expect(enqueueSueReport).toHaveBeenCalledWith(
    expect.objectContaining({ localId: 'existing-draft-id', deliveryStatus: 'pending' }),
    undefined
  );
  expect((enqueueSueReport as jest.Mock).mock.invocationCallOrder[0]).toBeLessThan(
    (AsyncStorage.removeItem as jest.Mock).mock.invocationCallOrder[0]
  );
  expect(tree.root.findByType('mock-SueReportSend').props).toMatchObject({
    isDone: true,
    isLoading: false,
    deliveryStatus: 'sent'
  });
  expect(Alert.alert).not.toHaveBeenCalled();
  renderer.act(() => tree.unmount());
});

it('shows a local-save alert and a waiting state for an offline submission', async () => {
  (readSueOutbox as jest.Mock).mockResolvedValue([
    { localId: 'existing-draft-id', deliveryStatus: 'pending' }
  ]);
  const tree = await mount();
  await renderer.act(async () => {
    await tree.root.findByType('mock-Button').props.onPress();
  });
  expect(tree.root.findByType('mock-SueReportSend').props.deliveryStatus).toBe('pending');
  expect(Alert.alert).toHaveBeenCalledWith(
    'Hinweis',
    expect.stringContaining('auf diesem Gerät gespeichert')
  );
  renderer.act(() => tree.unmount());
});

it('keeps the form and draft when durable queue storage fails', async () => {
  (enqueueSueReport as jest.Mock).mockRejectedValueOnce(new Error('Disk full'));
  const tree = await mount();
  await renderer.act(async () => {
    await tree.root.findByType('mock-Button').props.onPress();
  });
  expect(AsyncStorage.removeItem).not.toHaveBeenCalled();
  expect(syncSueOutbox).not.toHaveBeenCalled();
  expect(tree.root.findAllByType('mock-SueReportSend')).toHaveLength(0);
  expect(Alert.alert).toHaveBeenCalledWith('Hinweis', expect.stringContaining('konnte nicht'));
  renderer.act(() => tree.unmount());
});
