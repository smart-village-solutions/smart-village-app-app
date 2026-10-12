import { createChangers } from '../../modules/expo-changers/src/api';
import { ChangersNative, Statistics } from '../../modules/expo-changers/src/types';
import { createSummary } from '../../src/klimaTaler/createSummary';

const statistics = (coins: number) => ({
  coins,
  walkingDistance: 0,
  cyclingDistance: 0,
  co2Avoided: 0
});
const setup = (platform = 'ios', enabled = true) => {
  const native = {
    getStatus: jest.fn().mockResolvedValue({
      state: 'ready',
      activated: true,
      initialized: true,
      authenticated: true
    }),
    getUserUUID: jest.fn().mockResolvedValue('account-a'),
    fetchStatistics: jest.fn().mockResolvedValue(statistics(0)),
    activate: jest.fn(),
    registerUser: jest.fn()
  };
  const summary = createSummary(
    createChangers(native as unknown as ChangersNative, platform),
    () => enabled
  );
  return { native, summary };
};

test('real zero is ready, concurrent refreshes coalesce and reads never activate', async () => {
  const { native, summary } = setup();
  expect(summary.getSnapshot()).toEqual({ phase: 'loading' });
  await Promise.all([summary.refresh(), summary.refresh()]);
  expect(summary.getSnapshot()).toEqual({ phase: 'ready', coins: 0 });
  expect(native.fetchStatistics).toHaveBeenCalledTimes(1);
  expect(native.activate).not.toHaveBeenCalled();
  expect(native.registerUser).not.toHaveBeenCalled();
});

test('disabled and unauthenticated modules never fetch statistics', async () => {
  const disabled = setup('ios', false);
  await disabled.summary.refresh();
  expect(disabled.summary.getSnapshot()).toEqual({ phase: 'disabled' });
  expect(disabled.native.getStatus).not.toHaveBeenCalled();
  const { native, summary } = setup();
  native.getStatus.mockResolvedValue({ activated: false, authenticated: false });
  await summary.refresh();
  expect(summary.getSnapshot()).toEqual({ phase: 'noSession' });
  expect(native.fetchStatistics).not.toHaveBeenCalled();
});

test('Android never calls the unsafe native statistics method', async () => {
  const { native, summary } = setup('android');
  await summary.refresh();
  expect(summary.getSnapshot()).toEqual({ phase: 'unsupported' });
  expect(native.fetchStatistics).not.toHaveBeenCalled();
});

test('Android safe statistics flow displays the actual balance and retains it on transient failures', async () => {
  const native = {
    safeStatistics: true,
    getStatus: jest
      .fn()
      .mockResolvedValue({ activated: true, initialized: true, authenticated: true }),
    getUserUUID: jest.fn().mockResolvedValue('account-a'),
    fetchStatistics: jest.fn().mockResolvedValue(statistics(7))
  };
  const summary = createSummary(
    createChangers(native as unknown as ChangersNative, 'android'),
    () => true
  );
  await summary.refresh();
  expect(summary.getSnapshot()).toEqual({ phase: 'ready', coins: 7 });
  native.fetchStatistics.mockRejectedValue({ code: 'E_NETWORK' });
  await summary.refresh();
  expect(summary.getSnapshot()).toEqual({ phase: 'error', coins: 7, stale: true });
  native.getUserUUID.mockResolvedValue('account-b');
  await summary.refresh();
  expect(summary.getSnapshot()).toEqual({ phase: 'error' });
});

test('unsupported simulator never exposes a session or fabricated statistics', async () => {
  const { native, summary } = setup();
  native.getStatus.mockRejectedValue({ code: 'E_SIMULATOR_UNSUPPORTED' });
  await summary.refresh();
  expect(summary.getSnapshot()).toEqual({ phase: 'unsupported' });
  expect(native.fetchStatistics).not.toHaveBeenCalled();
  expect(native.activate).not.toHaveBeenCalled();
});

test.each([null, undefined, { coins: NaN }, { coins: '0' }])(
  'missing/invalid statistics never become zero: %p',
  async (value) => {
    const { native, summary } = setup();
    native.fetchStatistics.mockResolvedValue(value);
    await summary.refresh();
    expect(summary.getSnapshot()).toEqual({ phase: 'empty' });
  }
);

test('temporary errors preserve cache only after confirming the same account', async () => {
  const { native, summary } = setup();
  native.fetchStatistics.mockResolvedValueOnce(statistics(12));
  await summary.refresh();
  native.fetchStatistics.mockRejectedValue({ code: 'E_NETWORK' });
  await summary.refresh();
  expect(summary.getSnapshot()).toEqual({ phase: 'error', coins: 12, stale: true });
  native.getUserUUID.mockResolvedValue('account-b');
  await summary.refresh();
  expect(summary.getSnapshot()).toEqual({ phase: 'error' });
});

test('secure storage errors hide values without destroying recoverable cache', async () => {
  const { native, summary } = setup();
  await summary.refresh();
  native.getUserUUID
    .mockRejectedValueOnce(new Error('unavailable'))
    .mockRejectedValueOnce(new Error('unavailable'));
  await summary.refresh();
  expect(summary.getSnapshot()).toEqual({ phase: 'error' });
  native.fetchStatistics.mockRejectedValue({ code: 'E_NETWORK' });
  await summary.refresh();
  expect(summary.getSnapshot()).toEqual({ phase: 'error', coins: 0, stale: true });
});

test('logout hides old data and clears the identity-scoped cache', async () => {
  const { native, summary } = setup();
  await summary.refresh();
  native.getUserUUID.mockResolvedValue(null);
  await summary.refresh();
  expect(summary.getSnapshot()).toEqual({ phase: 'noSession' });
  native.getUserUUID.mockResolvedValue('account-a');
  native.fetchStatistics.mockRejectedValue({ code: 'E_NETWORK' });
  await summary.refresh();
  expect(summary.getSnapshot()).toEqual({ phase: 'error' });
});

test('late results cannot overwrite the current account after invalidation', async () => {
  const { native, summary } = setup();
  let resolve!: (value: Statistics) => void;
  native.fetchStatistics.mockImplementationOnce(
    () =>
      new Promise((done) => {
        resolve = done;
      })
  );
  const first = summary.refresh();
  await new Promise((done) => setImmediate(done));
  summary.invalidate();
  expect(summary.getSnapshot()).toEqual({ phase: 'loading' });
  native.getUserUUID.mockResolvedValue('account-b');
  native.fetchStatistics.mockResolvedValue(statistics(3));
  await summary.refresh();
  resolve(statistics(999));
  await first;
  expect(summary.getSnapshot()).toEqual({ phase: 'ready', coins: 3 });
});

test('account changes during a read discard the old result', async () => {
  const { native, summary } = setup();
  native.getUserUUID.mockResolvedValueOnce('account-a').mockResolvedValueOnce('account-b');
  await summary.refresh();
  expect(summary.getSnapshot().coins).toBeUndefined();
});

test('Home revisits reuse fresh data without emitting loading; expiry refreshes', async () => {
  jest.useFakeTimers().setSystemTime(1000);
  try {
    const { native, summary } = setup();
    await summary.refresh({ reuse: true });
    const changed = jest.fn();
    summary.subscribe(changed);
    jest.setSystemTime(1000 + 4 * 60 * 1000);
    await summary.refresh({ reuse: true });
    expect(native.fetchStatistics).toHaveBeenCalledTimes(1);
    expect(changed).not.toHaveBeenCalled();
    jest.setSystemTime(1000 + 5 * 60 * 1000);
    await summary.refresh({ reuse: true });
    expect(native.fetchStatistics).toHaveBeenCalledTimes(2);
  } finally {
    jest.useRealTimers();
  }
});

test('pull-to-refresh and provider/background invalidation bypass the freshness window', async () => {
  const { native, summary } = setup();
  await summary.refresh({ reuse: true });
  await summary.refresh();
  expect(native.fetchStatistics).toHaveBeenCalledTimes(2);
  summary.invalidate();
  native.getUserUUID.mockResolvedValue('account-b');
  native.fetchStatistics.mockResolvedValue(statistics(17));
  await summary.refresh({ reuse: true });
  expect(native.fetchStatistics).toHaveBeenCalledTimes(3);
  expect(summary.getSnapshot()).toEqual({ phase: 'ready', coins: 17 });
});

test('a failed forced refresh does not leave an earlier freshness timestamp behind', async () => {
  const { native, summary } = setup();
  await summary.refresh();
  native.fetchStatistics.mockRejectedValueOnce({ code: 'E_NETWORK' });
  await summary.refresh();
  expect(summary.getSnapshot().phase).toBe('error');
  await summary.refresh({ reuse: true });
  expect(native.fetchStatistics).toHaveBeenCalledTimes(3);
  expect(summary.getSnapshot()).toEqual({ phase: 'ready', coins: 0 });
});
