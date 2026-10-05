import { File } from 'expo-file-system';
import NetInfo from '@react-native-community/netinfo';

import { SUE_STATUS_SOURCE } from '../../../src/config';
import { addToStore, fetchSueEndpoints, readFromStore } from '../../../src/helpers';
import { myRequests, postRequests } from '../../../src/queries/SUE/requests';
import { requestsWithServiceRequestId } from '../../../src/queries/SUE/requestsWithServiceRequestId';
import { readSueOutbox } from '../../../src/helpers/sueReportStorage';

jest.mock('../../../src/config', () => jest.requireActual('../../../src/config/sue'));

jest.mock('../../../src/helpers/sueHelper', () => ({
  ...jest.requireActual('../../../src/helpers/sueHelper'),
  fetchSueEndpoints: jest.fn()
}));

jest.mock('../../../src/helpers/sueReportStorage', () => ({
  readSueOutbox: jest.fn().mockResolvedValue([]),
  sueOutboxPresentation: jest.requireActual('../../../src/helpers/sueReportStorage')
    .sueOutboxPresentation,
  updateSueOutboxStatuses: jest.fn()
}));

jest.mock('../../../src/helpers', () => ({
  ...jest.requireActual('../../../src/helpers/sueHelper'),
  addToStore: jest.fn(),
  fetchSueEndpoints: jest.requireMock('../../../src/helpers/sueHelper').fetchSueEndpoints,
  readFromStore: jest.fn()
}));

jest.mock('../../../src/queries/SUE/requestsWithServiceRequestId', () => ({
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
    jest.clearAllMocks();
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
    (readSueOutbox as jest.Mock).mockResolvedValue([]);
    jest.spyOn(Date, 'now').mockReturnValue(1_000_000);
    (requestsWithServiceRequestId as jest.Mock).mockResolvedValue({ serviceRequestId: 123 });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('keeps the legacy internal status visible by default', async () => {
    (readFromStore as jest.Mock).mockResolvedValue(JSON.stringify([storedReport()]));

    const [report] = await myRequests();

    expect(report.status).toBe('Unbearbeitet');
    expect(persistedReports()[0]).toMatchObject({
      lastStatusCheck: 1_000_000,
      status: 'Unbearbeitet',
      statusSource: SUE_STATUS_SOURCE.INTERNAL
    });
  });

  it('shows both legacy history and the new queue offline without querying report IDs', async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: false });
    (readFromStore as jest.Mock).mockResolvedValue(JSON.stringify([storedReport()]));
    (fetchSueEndpoints as jest.Mock).mockResolvedValue({
      suePostRequest: 'https://example.test/requests'
    });
    (readSueOutbox as jest.Mock).mockResolvedValue([
      {
        localId: 'local-1',
        endpoint: 'https://example.test/requests',
        deliveryStatus: 'pending',
        report: { title: 'Pending report', status: 'Unbearbeitet' }
      }
    ]);

    const reports = await myRequests();

    expect(reports).toHaveLength(2);
    expect(reports[0]).toMatchObject({ localId: 'local-1', deliveryStatus: 'pending' });
    expect(reports[0].status).toBeUndefined();
    expect(reports[0].serviceRequestId).toBeUndefined();
    expect(reports[1].serviceRequestId).toBe(123);
    expect(requestsWithServiceRequestId).not.toHaveBeenCalled();
    expect(persistedReports()).toHaveLength(1);
    expect(persistedReports()[0].serviceRequestId).toBe(123);
  });

  it('preserves malformed legacy storage rather than replacing it with an empty list', async () => {
    (readFromStore as jest.Mock).mockResolvedValue('{bad-json');
    jest.spyOn(console, 'error').mockImplementation(() => {});
    await expect(myRequests()).rejects.toThrow();
    expect(addToStore).not.toHaveBeenCalled();
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
      serviceRequestId: 123,
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
    (requestsWithServiceRequestId as jest.Mock).mockResolvedValue({
      serviceRequestId: '123',
      status: 'Unbearbeitet'
    });

    const [report] = await myRequests({ showInternalPendingStatus: false });

    expect(report.status).toBe('Unbearbeitet');
    expect(persistedReports()[0].statusSource).toBe(SUE_STATUS_SOURCE.API);
  });

  it.each([{}, null, { serviceRequestId: 456, status: 'TICKET_STATUS_CLOSED' }])(
    'does not confirm or overwrite a local report for an invalid lookup: %p',
    async (response) => {
      (readFromStore as jest.Mock).mockResolvedValue(JSON.stringify([storedReport()]));
      (requestsWithServiceRequestId as jest.Mock).mockResolvedValue(response);

      const [report] = await myRequests();

      expect(report.serviceRequestId).toBe(123);
      expect(report.status).toBe('Unbearbeitet');
      expect(persistedReports()[0]).not.toHaveProperty('lastStatusCheck');
    }
  );

  it('preserves local reports after a network failure so they can be checked again', async () => {
    (readFromStore as jest.Mock).mockResolvedValue(JSON.stringify([storedReport()]));
    (requestsWithServiceRequestId as jest.Mock).mockRejectedValue(new Error('Offline'));
    jest.spyOn(console, 'error').mockImplementation(() => {});

    const [report] = await myRequests();

    expect(report.serviceRequestId).toBe(123);
    expect(persistedReports()[0]).not.toHaveProperty('lastStatusCheck');
  });

  it('does not treat numeric API errors as workflow statuses or successful checks', async () => {
    (readFromStore as jest.Mock).mockResolvedValue(JSON.stringify([storedReport()]));
    (requestsWithServiceRequestId as jest.Mock).mockResolvedValue({ status: 404 });

    await myRequests({ showInternalPendingStatus: false });

    expect(persistedReports()[0]).not.toHaveProperty('lastStatusCheck');
    expect(persistedReports()[0].status).toBe('Unbearbeitet');
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
    ok: true,
    status: 201,
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

describe('SUE submission confirmation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetchSueEndpoints as jest.Mock).mockResolvedValue({
      apiKey: 'test-key',
      suePostRequest: 'https://example.test/sue'
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it.each([400, 401, 422, 500])(
    'rejects HTTP %s even when the body contains a report ID',
    async (status) => {
      const json = jest.fn().mockResolvedValue({ service_request_id: '38326' });
      jest
        .spyOn(global, 'fetch')
        .mockResolvedValue({ ok: false, status, json } as unknown as Response);

      await expect(postRequests({ images: '[]' })).rejects.toThrow(`HTTP ${status}`);
      expect(json).not.toHaveBeenCalled();
    }
  );

  it.each([
    null,
    {},
    [],
    [{ service_request_id: '123' }, { service_request_id: '456' }],
    { service_request_id: '' },
    { service_request_id: '   ' },
    { service_request_id: 0 },
    { service_request_id: -1 },
    { service_request_id: true },
    { service_request_id: { id: 123 } },
    { service_request_id: '38326', status: '400' },
    { service_request_id: '38326', status: 400 },
    [{ service_request_id: '38107', status: 500 }]
  ])('rejects an invalid API confirmation: %p', async (result) => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => result
    } as Response);

    await expect(postRequests({ images: '[]' })).rejects.toThrow(
      /invalid confirmation|submission failed/
    );
  });

  it.each([
    { service_request_id: '38326' },
    { service_request_id: 38107, status: 201 },
    [{ service_request_id: '38326', status: 200 }]
  ])('accepts a confirmed report in object or array format: %p', async (result) => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => result
    } as Response);

    await expect(postRequests({ images: '[]' })).resolves.toEqual(result);
  });

  it('rejects unreadable confirmation bodies', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => {
        throw new SyntaxError('Invalid JSON');
      }
    } as unknown as Response);

    await expect(postRequests({ images: '[]' })).rejects.toThrow('Invalid JSON');
  });
  it('bounds the entire submission including reading the confirmation body', async () => {
    jest.useFakeTimers();
    let signal: AbortSignal;
    jest.spyOn(global, 'fetch').mockImplementation(async (_url, options) => {
      signal = options!.signal as AbortSignal;
      return { ok: true, status: 201, json: () => new Promise(() => {}) } as Response;
    });
    try {
      const result = expect(postRequests({ images: '[]' })).rejects.toThrow('timed out');
      await jest.advanceTimersByTimeAsync(30_000);
      await result;
      expect(signal!.aborted).toBe(true);
    } finally {
      jest.useRealTimers();
    }
  });
});
