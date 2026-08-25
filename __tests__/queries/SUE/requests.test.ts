import { SUE_STATUS_SOURCE } from '../../../src/config';
import { addToStore, readFromStore } from '../../../src/helpers';
import { myRequests } from '../../../src/queries/SUE/requests';
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
