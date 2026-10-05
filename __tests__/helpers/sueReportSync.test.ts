import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { AppState } from 'react-native';

import { addToStore, readFromStore } from '../../src/helpers/storageHelper';
import { fetchSueEndpoints } from '../../src/helpers/sueHelper';
import {
  enqueueSueReport,
  readSueOutbox,
  SUE_OUTBOX,
  SueOutboxReport,
  updateSueOutbox
} from '../../src/helpers/sueReportStorage';
import { retrySueReport, syncSueOutbox } from '../../src/helpers/sueReportSync';
import {
  fetchSueWithTimeout,
  postRequests,
  SueSubmissionError
} from '../../src/queries/SUE/submitRequest';

const mockCopy = jest.fn().mockResolvedValue(undefined);
jest.mock('expo-file-system', () => ({
  Paths: { document: 'file:///documents' },
  Directory: class {
    uri: string;
    constructor(...parts: string[]) {
      this.uri = parts.join('/');
    }
    create() {
      /* directory created */
    }
  },
  File: class {
    uri: string;
    exists = true;
    constructor(...parts: (string | { uri: string })[]) {
      this.uri = parts.map((part) => (typeof part === 'string' ? part : part.uri)).join('/');
    }
    copy = mockCopy;
  }
}));

jest.mock('../../src/helpers/sueHelper', () => ({ fetchSueEndpoints: jest.fn() }));
jest.mock('../../src/queries/SUE/submitRequest', () => ({
  ...jest.requireActual('../../src/queries/SUE/submitRequest'),
  fetchSueWithTimeout: jest.fn(),
  postRequests: jest.fn()
}));

const entry = (overrides: Partial<SueOutboxReport> = {}): SueOutboxReport => ({
  localId: 'local-1',
  endpoint: 'https://example.test/requests',
  deliveryStatus: 'pending',
  attempts: 0,
  nextAttemptAt: 0,
  payload: { title: 'Report', images: '[]' },
  report: { title: 'Report', requestedDatetime: '2026-10-02T12:00:00Z' },
  ...overrides
});

beforeEach(async () => {
  jest.clearAllMocks();
  await AsyncStorage.clear();
  AppState.currentState = 'active';
  (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
  (fetchSueEndpoints as jest.Mock).mockResolvedValue({
    apiKey: 'test-key',
    suePostRequest: 'https://example.test/requests',
    sueServicesUrl: 'https://example.test/services',
    sueFetchObj: { method: 'GET' }
  });
  (fetchSueWithTimeout as jest.Mock).mockResolvedValue({ ok: true });
  (postRequests as jest.Mock).mockResolvedValue({ service_request_id: '38326' });
  mockCopy.mockResolvedValue(undefined);
});

it('does not migrate, erase or resend any legacy reports or drafts', async () => {
  const legacy = JSON.stringify([{ serviceRequestId: 38107 }, { title: 'Old local record' }]);
  await addToStore('sueMyReports', legacy);
  await addToStore('sueReportValues', { title: 'Unsent legacy draft' });
  await syncSueOutbox();
  expect(postRequests).not.toHaveBeenCalled();
  expect(await readFromStore('sueMyReports')).toBe(legacy);
  expect(await readFromStore('sueReportValues')).toEqual({ title: 'Unsent legacy draft' });
  expect(await AsyncStorage.getItem(SUE_OUTBOX)).toBeNull();
});

it('keeps offline submissions durable and sends exactly once on reconnection', async () => {
  (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: false });
  await enqueueSueReport(entry());
  await syncSueOutbox();
  expect(postRequests).not.toHaveBeenCalled();
  expect((await readSueOutbox())[0].deliveryStatus).toBe('pending');
  (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
  await syncSueOutbox(true);
  await syncSueOutbox(true);
  expect(postRequests).toHaveBeenCalledTimes(1);
  expect((await readSueOutbox())[0]).toMatchObject({
    deliveryStatus: 'sent',
    serviceRequestId: '38326'
  });
});

it('backs off while the server is unavailable and resumes when it recovers', async () => {
  await enqueueSueReport(entry());
  (fetchSueWithTimeout as jest.Mock).mockResolvedValueOnce({ ok: false });
  await syncSueOutbox();
  expect(postRequests).not.toHaveBeenCalled();
  expect((await readSueOutbox())[0].nextAttemptAt).toBeGreaterThan(Date.now());
  await syncSueOutbox();
  expect(fetchSueWithTimeout).toHaveBeenCalledTimes(1);
  await syncSueOutbox(true);
  expect(postRequests).toHaveBeenCalledTimes(1);
});

it.each([new Error('Timeout'), new SueSubmissionError(500)])(
  'does not automatically repeat an ambiguous POST: %p',
  async (error) => {
    await enqueueSueReport(entry());
    (postRequests as jest.Mock).mockRejectedValueOnce(error);
    await syncSueOutbox();
    await syncSueOutbox(true);
    expect(postRequests).toHaveBeenCalledTimes(1);
    expect((await readSueOutbox())[0].deliveryStatus).toBe('uncertain');
    await retrySueReport('local-1');
    expect(postRequests).toHaveBeenCalledTimes(2);
    expect((await readSueOutbox())[0].deliveryStatus).toBe('sent');
  }
);

it('requires manual action after explicit rejection', async () => {
  await enqueueSueReport(entry());
  (postRequests as jest.Mock).mockRejectedValueOnce(new SueSubmissionError(422));
  await syncSueOutbox();
  await syncSueOutbox(true);
  expect((await readSueOutbox())[0].deliveryStatus).toBe('failed');
  expect(postRequests).toHaveBeenCalledTimes(1);
});

it('recovers a process interrupted during POST without posting again', async () => {
  await addToStore(SUE_OUTBOX, { version: 1, reports: [entry({ deliveryStatus: 'sending' })] });
  await syncSueOutbox(true);
  expect(postRequests).not.toHaveBeenCalled();
  expect((await readSueOutbox())[0].deliveryStatus).toBe('uncertain');
});

it('does not send to another backend or from the background', async () => {
  await enqueueSueReport(entry({ endpoint: 'https://other.test/requests' }));
  await syncSueOutbox(true);
  expect(fetchSueWithTimeout).not.toHaveBeenCalled();
  await enqueueSueReport(entry({ localId: 'local-2' }));
  AppState.currentState = 'background';
  await syncSueOutbox(true);
  expect(postRequests).not.toHaveBeenCalled();
});

it('serializes concurrent enqueue and sync triggers without losing entries or posting twice', async () => {
  await Promise.all([
    enqueueSueReport(entry()),
    enqueueSueReport(entry()),
    enqueueSueReport(entry({ localId: 'local-2' }))
  ]);
  await Promise.all([syncSueOutbox(), syncSueOutbox(), syncSueOutbox()]);
  expect(await readSueOutbox()).toHaveLength(2);
  expect(postRequests).toHaveBeenCalledTimes(2);
});

it('waits for durable image copies before adding the queue entry', async () => {
  let finishCopy!: () => void;
  mockCopy.mockImplementationOnce(
    () =>
      new Promise<void>((resolve) => {
        finishCopy = resolve;
      })
  );
  const saved = enqueueSueReport(
    entry({
      payload: {
        images: JSON.stringify([{ uri: 'file:///cache/photo.jpg', mimeType: 'image/jpeg' }])
      }
    })
  );
  await new Promise((resolve) => setTimeout(resolve, 0));
  expect(await readSueOutbox()).toEqual([]);
  finishCopy();
  const result = await saved;
  expect(JSON.parse(result.payload.images)[0].uri).toBe(
    'file:///documents/sue-reports/local-1/image-0'
  );
});

it('does not enqueue or send when image persistence fails', async () => {
  mockCopy.mockRejectedValueOnce(new Error('Disk full'));
  await expect(
    enqueueSueReport(entry({ payload: { images: '[{"uri":"file:///photo.jpg"}]' } }))
  ).rejects.toThrow('Disk full');
  expect(await readSueOutbox()).toEqual([]);
  await syncSueOutbox();
  expect(postRequests).not.toHaveBeenCalled();
});

it('preserves unknown storage versions instead of overwriting them', async () => {
  await addToStore(SUE_OUTBOX, { version: 2, reports: [entry()] });
  await expect(enqueueSueReport(entry())).rejects.toThrow('Cannot read');
  expect((await readFromStore(SUE_OUTBOX)).version).toBe(2);
});

it('does not POST when saving the sending marker fails', async () => {
  await enqueueSueReport(entry());
  (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(new Error('Disk full'));
  await expect(syncSueOutbox()).rejects.toThrow('Disk full');
  expect(postRequests).not.toHaveBeenCalled();
  expect((await readSueOutbox())[0].deliveryStatus).toBe('pending');
});

it('does not resend a confirmed POST if persisting its receipt fails', async () => {
  await enqueueSueReport(entry());
  (postRequests as jest.Mock).mockImplementationOnce(async () => {
    (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(new Error('Disk full'));
    return { service_request_id: '38326' };
  });
  await syncSueOutbox();
  await syncSueOutbox(true);
  expect(postRequests).toHaveBeenCalledTimes(1);
  expect((await readSueOutbox())[0].deliveryStatus).toBe('uncertain');
});

it('merges status updates without overwriting a concurrent queue insertion', async () => {
  await enqueueSueReport(entry());
  await Promise.all([
    updateSueOutbox((reports) => {
      reports[0].deliveryStatus = 'sent';
    }),
    enqueueSueReport(entry({ localId: 'local-2' }))
  ]);
  expect(await readSueOutbox()).toHaveLength(2);
});

it('replaces only an explicitly rejected report after its edited copy is durably saved', async () => {
  await enqueueSueReport(entry({ deliveryStatus: 'failed' }));
  await enqueueSueReport(
    entry({ localId: 'edited-1', payload: { title: 'Corrected', images: '[]' } }),
    'local-1'
  );
  const reports = await readSueOutbox();
  expect(reports).toHaveLength(1);
  expect(reports[0]).toMatchObject({
    localId: 'edited-1',
    deliveryStatus: 'pending',
    payload: { title: 'Corrected' }
  });
});

it('keeps the original rejected report if persisting an edit fails', async () => {
  await enqueueSueReport(entry({ deliveryStatus: 'failed' }));
  (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(new Error('Disk full'));
  await expect(enqueueSueReport(entry({ localId: 'edited-1' }), 'local-1')).rejects.toThrow(
    'Disk full'
  );
  expect((await readSueOutbox())[0].localId).toBe('local-1');
});

it('does not replace a report with an uncertain or successful submission result', async () => {
  await enqueueSueReport(entry({ deliveryStatus: 'uncertain' }));
  await expect(enqueueSueReport(entry({ localId: 'edited-1' }), 'local-1')).rejects.toThrow(
    'Only a rejected report'
  );
  expect((await readSueOutbox())[0].localId).toBe('local-1');
});
