import { File } from 'expo-file-system';

import { SUE_STATUS_SOURCE } from '../../../src/config';
import { addToStore, fetchSueEndpoints, readFromStore } from '../../../src/helpers';
import { myRequests, postRequests } from '../../../src/queries/SUE/requests';
import { requestsWithServiceRequestId } from '../../../src/queries/SUE/requestsWithServiceRequestId';

jest.mock('../../../src/helpers', () => ({
  ...jest.requireActual('../../../src/helpers/sueHelper'),
  addToStore: jest.fn(),
  fetchSueEndpoints: jest.fn(),
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
      lastStatusCheck: 1_000_000,
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
