/* eslint-disable @typescript-eslint/no-var-requires */
const mockRemoveItem = jest.fn();
const mockReadFromStore = jest.fn();
const mockAddToStore = jest.fn();
let mockStoredDraft: Record<string, unknown> | undefined;

type DraftHelper = typeof import('../../src/helpers/sueReportDraftHelper');

jest.mock('@react-native-async-storage/async-storage', () => ({
  removeItem: (...args: unknown[]) => mockRemoveItem(...args)
}));
jest.mock('../../src/helpers/storageHelper', () => ({
  readFromStore: (...args: unknown[]) => mockReadFromStore(...args),
  addToStore: (...args: unknown[]) => mockAddToStore(...args)
}));

const newProcess = () => {
  let helper: DraftHelper;
  jest.isolateModules(() => {
    helper = require('../../src/helpers/sueReportDraftHelper');
  });
  return helper!;
};

beforeEach(() => {
  jest.clearAllMocks();
  mockStoredDraft = {
    title: 'Previous session',
    resumeAfterSettings: true,
    resumeRootRoute: 'Stack2'
  };
  mockRemoveItem.mockImplementation(async () => {
    mockStoredDraft = undefined;
  });
  mockReadFromStore.mockImplementation(async () => mockStoredDraft);
  mockAddToStore.mockImplementation(async (_key: string, value: Record<string, unknown>) => {
    mockStoredDraft = value;
  });
});

it('clears the previous draft on every new process, including obsolete Settings markers', async () => {
  const firstSession = newProcess();
  expect(await firstSession.readSueReportDraft()).toBeUndefined();
  await firstSession.storeSueReportDraft({ title: 'Unfinished new report' });

  const nextSession = newProcess();
  expect(await nextSession.readSueReportDraft()).toBeUndefined();
  expect(mockRemoveItem).toHaveBeenCalledTimes(2);
  expect(mockRemoveItem).toHaveBeenLastCalledWith('sueReportValues');
});

it('initializes once and restores same-session drafts after Settings or a screen remount', async () => {
  const session = newProcess();
  const startup = session.initializeSueReportSession();
  expect(session.initializeSueReportSession()).toBe(startup);
  await startup;
  const draft = {
    title: 'Current report',
    currentProgress: 1,
    images: '[{"uri":"file:///photo.jpg"}]'
  };
  await session.storeSueReportDraft(draft);

  await session.initializeSueReportSession();
  expect(await session.readSueReportDraft()).toEqual(draft);
  expect(mockRemoveItem).toHaveBeenCalledTimes(1);
});

it('does not read an old snapshot while startup cleanup is pending', async () => {
  let finishCleanup: () => void = () => undefined;
  mockRemoveItem.mockImplementationOnce(
    () =>
      new Promise<void>((resolve) => {
        finishCleanup = () => {
          mockStoredDraft = undefined;
          resolve();
        };
      })
  );
  const session = newProcess();
  const restored = session.readSueReportDraft();

  expect(mockReadFromStore).not.toHaveBeenCalled();
  finishCleanup();
  expect(await restored).toBeUndefined();
});

it('allows startup after a cleanup failure without exposing the stale draft', async () => {
  mockRemoveItem.mockRejectedValueOnce(new Error('Storage temporarily unavailable'));
  const session = newProcess();

  await expect(session.initializeSueReportSession()).resolves.toBeUndefined();
  expect(await session.readSueReportDraft()).toBeUndefined();
  expect(mockReadFromStore).not.toHaveBeenCalled();
  expect(mockStoredDraft?.title).toBe('Previous session');

  await session.storeSueReportDraft({ title: 'Current session' });
  expect(await session.readSueReportDraft()).toEqual({ title: 'Current session' });
  expect(mockRemoveItem).toHaveBeenCalledTimes(1);
});

it('does not enable stale restoration when a new snapshot also fails to save', async () => {
  mockRemoveItem.mockRejectedValueOnce(new Error('Cannot clear storage'));
  mockAddToStore.mockRejectedValueOnce(new Error('Cannot write storage'));
  const session = newProcess();

  await expect(session.storeSueReportDraft({ title: 'Current session' })).rejects.toThrow(
    'Cannot write storage'
  );
  expect(await session.readSueReportDraft()).toBeUndefined();
  expect(mockReadFromStore).not.toHaveBeenCalled();
});
