import { createChangers } from '../../modules/expo-changers/src/api';
import { ChangersNative, Status } from '../../modules/expo-changers/src/types';
import { createEntry } from '../../src/klimaTaler/createEntry';

const status = (overrides: Partial<Status> = {}): Status => ({
  platform: 'ios',
  environment: 'stage',
  sdkVersion: 'fixture',
  motionTagVersion: 'fixture',
  state: 'ready',
  activated: true,
  initialized: true,
  authenticated: true,
  tracking: 'unknown',
  providerOpen: false,
  ...overrides
});
const setup = (platform = 'ios', enabled = true) => {
  let onClosed = () => undefined;
  const native = {
    getStatus: jest.fn().mockResolvedValue(status()),
    activate: jest.fn().mockResolvedValue(status({ authenticated: false })),
    getUserUUID: jest.fn().mockResolvedValue(null),
    registerUser: jest.fn().mockResolvedValue('fixture-account'),
    loginUser: jest.fn().mockResolvedValue('fixture-account'),
    openProvider: jest.fn().mockResolvedValue(undefined),
    closeProvider: jest.fn().mockResolvedValue(undefined),
    addListener: jest.fn((_event, listener) => {
      onClosed = listener;
      return { remove: jest.fn() };
    })
  };
  const entry = createEntry(
    createChangers(native as unknown as ChangersNative, platform),
    () => enabled
  );
  return { native, entry, close: () => onClosed() };
};

test('repeated taps share a single opening and reuse the existing identity', async () => {
  const { native, entry } = setup();
  await Promise.all([entry.open(), entry.open(), entry.open()]);
  expect(native.openProvider).toHaveBeenCalledTimes(1);
  expect(native.activate).not.toHaveBeenCalled();
  expect(native.registerUser).not.toHaveBeenCalled();
  expect(entry.getSnapshot().phase).toBe('open');
});

test('iOS first entry activates and registers only after an explicit open', async () => {
  const { native, entry } = setup();
  native.getStatus.mockResolvedValue(
    status({ state: 'inactive', activated: false, initialized: false, authenticated: false })
  );
  expect(native.activate).not.toHaveBeenCalled();
  await entry.open();
  expect(native.activate).toHaveBeenCalledTimes(1);
  expect(native.registerUser).toHaveBeenCalledTimes(1);
  expect(native.openProvider).toHaveBeenCalledTimes(1);
});

test('Android leaves registration to the provider UI', async () => {
  const { native, entry } = setup('android');
  native.getStatus.mockResolvedValue(status({ authenticated: false }));
  await entry.open();
  expect(native.registerUser).not.toHaveBeenCalled();
  expect(native.openProvider).toHaveBeenCalledTimes(1);
});

test('an existing UUID is restored and a lost session never creates another account', async () => {
  const { native, entry } = setup();
  native.getStatus.mockResolvedValue(status({ authenticated: false }));
  await entry.open();
  expect(entry.getSnapshot().errorCode).toBe('E_AUTHENTICATION');
  expect(native.registerUser).not.toHaveBeenCalled();
  native.getUserUUID.mockResolvedValue('fixture-account');
  await entry.open();
  expect(native.loginUser).toHaveBeenCalledWith('fixture-account');
});

test('dismissal returns to idle and allows opening again', async () => {
  const { native, entry, close } = setup();
  const unsubscribe = entry.subscribe(jest.fn());
  await entry.open();
  close();
  expect(entry.getSnapshot().phase).toBe('idle');
  await entry.open();
  expect(native.openProvider).toHaveBeenCalledTimes(2);
  unsubscribe();
});

test('navigation cancellation prevents a delayed request from presenting UI', async () => {
  const { native, entry } = setup();
  let resolve!: (value: Status) => void;
  native.getStatus.mockReturnValue(
    new Promise<Status>((done) => {
      resolve = done;
    })
  );
  const pending = entry.open();
  entry.cancel();
  resolve(status());
  await pending;
  expect(native.openProvider).not.toHaveBeenCalled();
});

test('disabled integration does not reach the SDK', async () => {
  const { native, entry } = setup('ios', false);
  await entry.open();
  expect(entry.getSnapshot().errorCode).toBe('E_DISABLED');
  expect(native.getStatus).not.toHaveBeenCalled();
});

test('temporary provider failures allow retry without replacing the account', async () => {
  const { native, entry } = setup();
  native.openProvider.mockRejectedValueOnce({ code: 'E_NETWORK' });
  await entry.open();
  expect(entry.getSnapshot().errorCode).toBe('E_NETWORK');
  await entry.open();
  expect(entry.getSnapshot().phase).toBe('open');
  expect(native.registerUser).not.toHaveBeenCalled();
});

test('cancellation during native presentation dismisses the late controller', async () => {
  const { native, entry } = setup();
  let resolve!: () => void;
  native.openProvider.mockImplementationOnce(
    () =>
      new Promise<void>((done) => {
        resolve = done;
      })
  );
  const opening = entry.open();
  await new Promise((done) => setImmediate(done));
  entry.cancel();
  resolve();
  await opening;
  expect(entry.getSnapshot().phase).toBe('idle');
  expect(native.closeProvider).toHaveBeenCalled();
});

test('reopening while a cancelled initialization settles starts a fresh opening', async () => {
  const { native, entry } = setup();
  let resolve!: (value: Status) => void;
  native.getStatus.mockImplementationOnce(
    () =>
      new Promise<Status>((done) => {
        resolve = done;
      })
  );
  const first = entry.open();
  entry.cancel();
  const second = entry.open();
  resolve(status());
  await Promise.all([first, second]);
  expect(entry.getSnapshot().phase).toBe('open');
  expect(native.openProvider).toHaveBeenCalledTimes(1);
});

test('a disabled entry can be cancelled and reopened without retaining its settled request', async () => {
  const { native, entry } = setup('ios', false);
  await entry.open();
  entry.cancel();
  await entry.open();
  expect(entry.getSnapshot().errorCode).toBe('E_DISABLED');
  expect(native.getStatus).not.toHaveBeenCalled();
});

test('a definitely undispatched signup can retry after activation and coordinator restart', async () => {
  const { native } = setup();
  let activated = false;
  let attempted = false;
  let online = false;
  const current = () =>
    status({
      activated,
      initialized: activated,
      authenticated: false,
      registrationState: attempted ? 'uncertain' : 'notStarted'
    });
  native.getStatus.mockImplementation(async () => current());
  native.activate.mockImplementation(async () => {
    activated = true;
    return current();
  });
  native.registerUser.mockImplementation(async () => {
    if (!online) throw { code: 'E_NETWORK' };
    attempted = true;
    return 'fixture-account';
  });
  const client = createChangers(native as unknown as ChangersNative, 'ios');
  const first = createEntry(client, () => true);
  await first.open();
  expect(first.getSnapshot().errorCode).toBe('E_NETWORK');
  online = true;
  const restarted = createEntry(client, () => true);
  await Promise.all([restarted.open(), restarted.open()]);
  expect(restarted.getSnapshot().phase).toBe('open');
  expect(native.registerUser).toHaveBeenCalledTimes(2);
  expect(native.activate).toHaveBeenCalledTimes(1);
});

test('an uncertain signup never repeats, including after restart or stopTracking', async () => {
  const { native } = setup();
  native.getStatus.mockResolvedValue(
    status({ authenticated: false, registrationState: 'uncertain' })
  );
  const client = createChangers(native as unknown as ChangersNative, 'ios');
  for (let restart = 0; restart < 2; restart++) {
    const entry = createEntry(client, () => true);
    await entry.open();
    expect(entry.getSnapshot().errorCode).toBe('E_REGISTRATION_UNCERTAIN');
  }
  native.getStatus.mockResolvedValue(
    status({ activated: false, authenticated: false, registrationState: 'uncertain' })
  );
  native.activate.mockResolvedValue(
    status({ authenticated: false, registrationState: 'uncertain' })
  );
  await createEntry(client, () => true).open();
  expect(native.registerUser).not.toHaveBeenCalled();
  expect(native.openProvider).not.toHaveBeenCalled();
});

test('an existing UUID survives a temporary login failure and never falls back to signup', async () => {
  const { native, entry } = setup();
  native.getStatus.mockResolvedValue(
    status({ authenticated: false, registrationState: 'existing' })
  );
  native.getUserUUID.mockResolvedValue('existing-account');
  native.loginUser.mockRejectedValueOnce({ code: 'E_NETWORK' });
  await entry.open();
  expect(entry.getSnapshot().errorCode).toBe('E_NETWORK');
  await entry.open();
  expect(native.loginUser).toHaveBeenNthCalledWith(2, 'existing-account');
  expect(native.registerUser).not.toHaveBeenCalled();
  expect(entry.getSnapshot().phase).toBe('open');
});

test('a missing identity after provider deletion does not create another account', async () => {
  const { native, entry } = setup();
  native.getStatus.mockResolvedValue(
    status({ authenticated: false, registrationState: 'existing' })
  );
  await entry.open();
  expect(entry.getSnapshot().errorCode).toBe('E_AUTHENTICATION');
  expect(native.registerUser).not.toHaveBeenCalled();
});
