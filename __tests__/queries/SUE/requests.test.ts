import { File } from 'expo-file-system';

import { SUE_STATUS, SUE_STATUS_SOURCE } from '../../../src/config/sue';
import { addToStore, fetchSueEndpoints, readFromStore } from '../../../src/helpers';
import { updateSueMyReports } from '../../../src/helpers/sueReportStorageHelper';
import { myRequests, postRequests } from '../../../src/queries/SUE/requests';
import {
  requestsWithServiceRequestId,
  SueRequestError
} from '../../../src/queries/SUE/requestsWithServiceRequestId';

jest.mock('../../../src/helpers', () => ({
  ...jest.requireActual('../../../src/helpers/sueHelper'),
  ...jest.requireMock('../../../src/helpers/storageHelper'),
  fetchSueEndpoints: jest.fn()
}));

jest.mock('../../../src/helpers/storageHelper', () => ({
  addToStore: jest.fn(),
  readFromStore: jest.fn()
}));

jest.mock('../../../src/queries/SUE/requestsWithServiceRequestId', () => ({
  ...jest.requireActual('../../../src/queries/SUE/requestsWithServiceRequestId'),
  requestsWithServiceRequestId: jest.fn()
}));

const storedReport = (overrides = {}) => ({
  serviceRequestId: 123,
  status: 'Unbearbeitet',
  title: 'Testmeldung',
  ...overrides
});

const persistedReports = () => JSON.parse((addToStore as jest.Mock).mock.calls.at(-1)[1] as string);

describe('SUE myRequests status handling', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(Date, 'now').mockReturnValue(1_000_000);
    (requestsWithServiceRequestId as jest.Mock).mockResolvedValue({});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('keeps the legacy internal status visible by default', async () => {
    (readFromStore as jest.Mock).mockResolvedValue(JSON.stringify([storedReport()]));

    const [report] = await myRequests();

    expect(report.status).toBe('Unbearbeitet');
    expect(persistedReports()[0]).toMatchObject({
      status: 'Unbearbeitet',
      statusSource: SUE_STATUS_SOURCE.INTERNAL
    });
  });

  it('hides a legacy internal status when explicitly disabled', async () => {
    (readFromStore as jest.Mock).mockResolvedValue(JSON.stringify([storedReport()]));

    const [report] = await myRequests({ showInternalPendingStatus: false });

    expect(report.status).toBeUndefined();
    expect(persistedReports()[0].status).toBe('Unbearbeitet');
  });

  it('always exposes and persists a status supplied by the API', async () => {
    (readFromStore as jest.Mock).mockResolvedValue(JSON.stringify([storedReport()]));
    (requestsWithServiceRequestId as jest.Mock).mockResolvedValue({
      status: 'TICKET_STATUS_IN_PROCESS'
    });

    const [report] = await myRequests({ showInternalPendingStatus: false });

    expect(report.status).toBe('TICKET_STATUS_IN_PROCESS');
    expect(persistedReports()[0]).toMatchObject({
      status: 'TICKET_STATUS_IN_PROCESS',
      statusSource: SUE_STATUS_SOURCE.API
    });
  });

  it('promotes a same-text API status to API provenance', async () => {
    (readFromStore as jest.Mock).mockResolvedValue(JSON.stringify([storedReport()]));
    (requestsWithServiceRequestId as jest.Mock).mockResolvedValue({ status: 'Unbearbeitet' });

    const [report] = await myRequests({ showInternalPendingStatus: false });

    expect(report.status).toBe('Unbearbeitet');
    expect(persistedReports()[0].statusSource).toBe(SUE_STATUS_SOURCE.API);
  });

  it('does not treat numeric API errors as workflow statuses or successful checks', async () => {
    (readFromStore as jest.Mock).mockResolvedValue(JSON.stringify([storedReport()]));
    (requestsWithServiceRequestId as jest.Mock).mockResolvedValue({ status: 404 });

    await myRequests({ showInternalPendingStatus: false });

    expect(persistedReports()[0]).not.toHaveProperty('lastStatusCheck');
    expect(persistedReports()[0].status).toBe('Unbearbeitet');
  });

  it('keeps cached statuses within the TTL until explicitly refreshed', async () => {
    (readFromStore as jest.Mock).mockResolvedValue(
      JSON.stringify([storedReport({ lastStatusCheck: 999_999 })])
    );
    (requestsWithServiceRequestId as jest.Mock).mockResolvedValue({
      status: SUE_STATUS.IN_PROCESS
    });

    await myRequests();
    expect(requestsWithServiceRequestId).not.toHaveBeenCalled();

    const [report] = await myRequests({ forceRefresh: true });
    expect(requestsWithServiceRequestId).toHaveBeenCalledWith(123);
    expect(report.status).toBe(SUE_STATUS.IN_PROCESS);
    expect(persistedReports()[0].lastStatusCheck).toBe(1_000_000);
  });

  it.each([SUE_STATUS.CLOSED, SUE_STATUS.INVALID])(
    'refreshes a final %s status after the TTL',
    async (status) => {
      (readFromStore as jest.Mock).mockResolvedValue(
        JSON.stringify([storedReport({ status, lastStatusCheck: 1 })])
      );
      (requestsWithServiceRequestId as jest.Mock).mockResolvedValue({ status: SUE_STATUS.OPEN });

      const [report] = await myRequests();

      expect(report.status).toBe(SUE_STATUS.OPEN);
    }
  );

  it.each([404, 410])('removes a previously confirmed report after HTTP %s', async (status) => {
    (readFromStore as jest.Mock).mockResolvedValue(
      JSON.stringify([
        storedReport({ status: SUE_STATUS.CLOSED, lastStatusCheck: 1 }),
        storedReport({ serviceRequestId: 456 })
      ])
    );
    (requestsWithServiceRequestId as jest.Mock).mockRejectedValue(new SueRequestError(status));
    jest.spyOn(console, 'error').mockImplementation(() => undefined);

    const reports = await myRequests();

    expect(reports.map((report) => report.serviceRequestId)).toEqual([456]);
    expect(persistedReports().map((report) => report.serviceRequestId)).toEqual([456]);
  });

  it.each([404, 410])(
    'preserves a pending report that has never been published after HTTP %s',
    async (status) => {
      (readFromStore as jest.Mock).mockResolvedValue(JSON.stringify([storedReport()]));
      (requestsWithServiceRequestId as jest.Mock).mockRejectedValue(new SueRequestError(status));
      jest.spyOn(console, 'error').mockImplementation(() => undefined);

      const reports = await myRequests();

      expect(reports).toHaveLength(1);
      expect(persistedReports()[0]).not.toHaveProperty('lastStatusCheck');
    }
  );

  it.each([
    new SueRequestError(500),
    new SueRequestError(401),
    new TypeError('Network request failed')
  ])('preserves a confirmed report after a temporary or authorization error: %s', async (error) => {
    (readFromStore as jest.Mock).mockResolvedValue(
      JSON.stringify([storedReport({ status: SUE_STATUS.CLOSED, lastStatusCheck: 1 })])
    );
    (requestsWithServiceRequestId as jest.Mock).mockRejectedValue(error);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);

    const reports = await myRequests();

    expect(reports).toHaveLength(1);
    expect(persistedReports()[0]).toMatchObject({ status: SUE_STATUS.CLOSED, lastStatusCheck: 1 });
  });

  it.each([
    undefined,
    {},
    { status: '' },
    { status: 404 },
    { serviceRequestId: 456, status: SUE_STATUS.OPEN }
  ])(
    'does not mark an empty, malformed or mismatched response as a successful check: %s',
    async (response) => {
      (readFromStore as jest.Mock).mockResolvedValue(JSON.stringify([storedReport()]));
      (requestsWithServiceRequestId as jest.Mock).mockResolvedValue(response);

      const reports = await myRequests();

      expect(reports).toHaveLength(1);
      expect(persistedReports()[0]).not.toHaveProperty('lastStatusCheck');
    }
  );

  it('preserves reports submitted while an older status lookup is pending', async () => {
    let storedReports = [storedReport()];
    (readFromStore as jest.Mock).mockImplementation(async () => JSON.stringify(storedReports));
    (addToStore as jest.Mock).mockImplementation(async (_key, value) => {
      storedReports = JSON.parse(value);
    });
    let completeLookup!: (report: unknown) => void;
    let lookupStarted!: () => void;
    const started = new Promise<void>((resolve) => {
      lookupStarted = resolve;
    });
    (requestsWithServiceRequestId as jest.Mock).mockImplementation(() => {
      lookupStarted();
      return new Promise((resolve) => {
        completeLookup = resolve;
      });
    });

    const refresh = myRequests();
    await started;
    await updateSueMyReports((reports) => [storedReport({ serviceRequestId: 456 }), ...reports]);
    completeLookup({ status: SUE_STATUS.OPEN });

    const reports = await refresh;

    expect(reports.map((report) => report.serviceRequestId)).toEqual([456, 123]);
    expect(storedReports[1].status).toBe(SUE_STATUS.OPEN);
  });

  it('does not overwrite a status saved by a newer refresh', async () => {
    (readFromStore as jest.Mock)
      .mockResolvedValueOnce(JSON.stringify([storedReport()]))
      .mockResolvedValue(
        JSON.stringify([storedReport({ status: SUE_STATUS.CLOSED, lastStatusCheck: 1_000_001 })])
      );
    (requestsWithServiceRequestId as jest.Mock).mockResolvedValue({ status: SUE_STATUS.OPEN });

    const [report] = await myRequests();

    expect(report.status).toBe(SUE_STATUS.CLOSED);
    expect(persistedReports()[0].lastStatusCheck).toBe(1_000_001);
  });

  it('does not restore a report removed while its lookup was pending', async () => {
    (readFromStore as jest.Mock)
      .mockResolvedValueOnce(JSON.stringify([storedReport()]))
      .mockResolvedValue(JSON.stringify([]));
    (requestsWithServiceRequestId as jest.Mock).mockResolvedValue({ status: SUE_STATUS.OPEN });

    const reports = await myRequests();

    expect(reports).toEqual([]);
    expect(persistedReports()).toEqual([]);
  });

  it('does not overwrite reports when reading storage fails', async () => {
    (readFromStore as jest.Mock).mockRejectedValue(new Error('Storage temporarily unavailable'));
    jest.spyOn(console, 'error').mockImplementation(() => undefined);

    await expect(myRequests()).rejects.toThrow('Storage temporarily unavailable');

    expect(addToStore).not.toHaveBeenCalled();
  });
});

it('uploads SUE images as byte-backed multipart files', async () => {
  (fetchSueEndpoints as jest.Mock).mockResolvedValue({
    apiKey: 'test-key',
    suePostRequest: 'https://example.test/sue'
  });
  const appendSpy = jest.spyOn(FormData.prototype, 'append').mockImplementation(() => {});
  const bytesSpy = jest.spyOn(File.prototype, 'bytes').mockResolvedValue(new Uint8Array([1, 2]));
  const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
    json: async () => ({ service_request_id: '123' })
  } as Response);

  try {
    await postRequests({
      images: JSON.stringify([
        { uri: 'file:///report.jpg', imageName: 'report.jpg', mimeType: 'image/jpeg' }
      ]),
      title: 'Report'
    });

    const attachment = appendSpy.mock.calls.find(([name]) => name === 'media_file_1')?.[1];
    expect(attachment).toEqual({
      name: 'report.jpg',
      type: 'image/jpeg',
      bytes: expect.any(Function)
    });
    expect(await attachment.bytes()).toEqual(new Uint8Array([1, 2]));
    expect(bytesSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledWith(
      'https://example.test/sue',
      expect.objectContaining({
        headers: { accept: 'application/json', api_key: 'test-key' },
        body: expect.any(FormData)
      })
    );
  } finally {
    jest.restoreAllMocks();
  }
});
