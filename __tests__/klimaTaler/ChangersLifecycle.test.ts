import { Alert, AppState, AppStateStatus } from 'react-native';

import changers from '../../modules/expo-changers';
import { configureKlimaTaler } from '../../src/klimaTaler/configure';
import { klimaTalerEntry, openKlimaTaler } from '../../src/klimaTaler/entry';
import { klimaTalerSummary } from '../../src/klimaTaler/summary';

let mockClosed: () => void;
const mockRemove = jest.fn();
jest.mock('../../modules/expo-changers', () => ({
  __esModule: true,
  default: {
    capabilities: { registerUser: { supported: true }, statistics: { supported: true } },
    setEnabled: jest.fn().mockResolvedValue(undefined),
    getStatus: jest.fn(),
    getUserUUID: jest.fn().mockResolvedValue('account-a'),
    fetchStatistics: jest.fn().mockResolvedValue({ coins: 10 }),
    openProvider: jest.fn().mockResolvedValue(undefined),
    closeProvider: jest.fn().mockResolvedValue(undefined),
    addProviderClosedListener: (closed: () => void) => {
      mockClosed = closed;
      return { remove: mockRemove };
    }
  }
}));
const native = jest.mocked(changers);
let changeAppState: (next: AppStateStatus) => Promise<void>;
const flush = () => new Promise<void>((done) => setImmediate(done));

beforeEach(() => {
  configureKlimaTaler(false);
  jest.clearAllMocks();
  jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_event, handler) => {
    changeAppState = handler as typeof changeAppState;
    return { remove: jest.fn() };
  });
  native.getStatus.mockResolvedValue({
    state: 'ready',
    activated: true,
    initialized: true,
    authenticated: true,
    providerOpen: false
  } as never);
  configureKlimaTaler(true);
});
afterEach(() => {
  configureKlimaTaler(false);
  jest.restoreAllMocks();
});

test('direct entry coalesces taps and native X refreshes even with no mounted widget', async () => {
  await Promise.all([openKlimaTaler(), openKlimaTaler()]);
  expect(native.openProvider).toHaveBeenCalledTimes(1);
  expect(klimaTalerEntry.getSnapshot().phase).toBe('open');
  mockClosed();
  await flush();
  expect(klimaTalerEntry.getSnapshot().phase).toBe('idle');
  expect(klimaTalerSummary.getSnapshot()).toEqual({ phase: 'ready', coins: 10 });
  expect(native.fetchStatistics).toHaveBeenCalledTimes(1);
  await openKlimaTaler();
  expect(native.openProvider).toHaveBeenCalledTimes(2);
});

test('foreground return reconciles a missed close event without duplicate reads', async () => {
  await openKlimaTaler();
  await changeAppState('active');
  await flush();
  expect(klimaTalerEntry.getSnapshot().phase).toBe('idle');
  expect(native.fetchStatistics).toHaveBeenCalledTimes(1);
  await changeAppState('active');
  expect(native.fetchStatistics).toHaveBeenCalledTimes(1);
  await changeAppState('background');
  expect(klimaTalerSummary.getSnapshot().coins).toBeUndefined();
  await changeAppState('active');
  await flush();
  expect(native.fetchStatistics).toHaveBeenCalledTimes(2);
});

test('an opening failure offers one native alert and retry without a route', async () => {
  native.openProvider.mockRejectedValueOnce(new Error('offline'));
  await Promise.all([openKlimaTaler(), openKlimaTaler()]);
  expect(Alert.alert).toHaveBeenCalledTimes(1);
  const buttons = jest.mocked(Alert.alert).mock.calls[0][2]!;
  buttons.find((button) => button.text === 'Erneut versuchen')!.onPress!();
  await flush();
  expect(native.openProvider).toHaveBeenCalledTimes(2);
  expect(klimaTalerEntry.getSnapshot().phase).toBe('open');
});

test('disabling removes the native listener and prevents new reads or entry', async () => {
  configureKlimaTaler(false);
  expect(mockRemove).toHaveBeenCalledTimes(1);
  await changeAppState('active');
  await openKlimaTaler();
  expect(native.fetchStatistics).not.toHaveBeenCalled();
  expect(native.openProvider).not.toHaveBeenCalled();
});
