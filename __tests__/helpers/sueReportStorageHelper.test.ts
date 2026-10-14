import { SUE_MY_REPORTS } from '../../src/config/sue';
import { addToStore, readFromStore } from '../../src/helpers/storageHelper';
import { updateSueMyReports } from '../../src/helpers/sueReportStorageHelper';

jest.mock('../../src/helpers/storageHelper', () => ({
  addToStore: jest.fn(),
  readFromStore: jest.fn()
}));

beforeEach(() => {
  jest.resetAllMocks();
});

it('serializes overlapping updates against the latest persisted reports', async () => {
  let storedValue = JSON.stringify([{ serviceRequestId: 1 }]);
  let releaseWrite!: () => void;
  let writeStarted!: () => void;
  const started = new Promise<void>((resolve) => {
    writeStarted = resolve;
  });
  const heldWrite = new Promise<void>((resolve) => {
    releaseWrite = resolve;
  });
  (readFromStore as jest.Mock).mockImplementation(async () => storedValue);
  (addToStore as jest.Mock)
    .mockImplementationOnce(async (_key, value) => {
      writeStarted();
      await heldWrite;
      storedValue = value;
    })
    .mockImplementation(async (_key, value) => {
      storedValue = value;
    });

  const first = updateSueMyReports((reports) => [{ serviceRequestId: 2 }, ...reports]);
  await started;
  const second = updateSueMyReports((reports) => [{ serviceRequestId: 3 }, ...reports]);
  expect(readFromStore).toHaveBeenCalledTimes(1);
  releaseWrite();

  await Promise.all([first, second]);

  expect(JSON.parse(storedValue).map((report) => report.serviceRequestId)).toEqual([3, 2, 1]);
  expect(addToStore).toHaveBeenLastCalledWith(SUE_MY_REPORTS, storedValue);
});

it('allows later updates to recover after a storage read fails', async () => {
  (readFromStore as jest.Mock)
    .mockRejectedValueOnce(new Error('Unavailable'))
    .mockResolvedValue(JSON.stringify([{ serviceRequestId: 1 }]));

  await expect(updateSueMyReports((reports) => reports)).rejects.toThrow('Unavailable');
  const reports = await updateSueMyReports((current) => [{ serviceRequestId: 2 }, ...current]);

  expect(reports).toEqual([{ serviceRequestId: 2 }, { serviceRequestId: 1 }]);
  expect(addToStore).toHaveBeenCalledTimes(1);
});

it('does not replace malformed storage with an empty list', async () => {
  (readFromStore as jest.Mock).mockResolvedValue('{"unexpected":true}');

  await expect(updateSueMyReports(() => [])).rejects.toThrow('Invalid stored SUE reports');
  expect(addToStore).not.toHaveBeenCalled();
});

it('allows a new submission after a failed storage write', async () => {
  (readFromStore as jest.Mock).mockResolvedValue(JSON.stringify([{ serviceRequestId: 1 }]));
  (addToStore as jest.Mock)
    .mockRejectedValueOnce(new Error('Write unavailable'))
    .mockResolvedValue(undefined);

  await expect(updateSueMyReports((reports) => reports)).rejects.toThrow('Write unavailable');
  const reports = await updateSueMyReports((current) => [{ serviceRequestId: 2 }, ...current]);

  expect(reports).toEqual([{ serviceRequestId: 2 }, { serviceRequestId: 1 }]);
  expect(addToStore).toHaveBeenCalledTimes(2);
});
