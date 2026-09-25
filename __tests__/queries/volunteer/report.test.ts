jest.mock('../../../src/helpers/volunteerHelper', () => ({
  volunteerApiV2Url: 'https://example.test/api/v2/',
  volunteerAuthToken: jest.fn(async () => 'token-123')
}));

import { reportVolunteerTarget } from '../../../src/queries/volunteer/report';
import { VolunteerReportError, VolunteerReportReason } from '../../../src/types';

describe('reportVolunteerTarget', () => {
  beforeEach(() => {
    globalThis.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it.each([
    [201, false],
    [200, true]
  ])('accepts status %s', async (status, duplicate) => {
    (globalThis.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status,
      json: async () => ({
        code: status,
        message: 'ok',
        report: {
          id: 7,
          targetType: 'content',
          targetId: 39,
          reason: 3,
          createdAt: '2026-09-18 10:00:00',
          duplicate
        }
      })
    });

    const result = await reportVolunteerTarget({
      targetType: 'content',
      targetId: 39,
      reason: VolunteerReportReason.SPAM
    });

    expect(globalThis.fetch).toHaveBeenCalledWith('https://example.test/api/v2/reports', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer token-123'
      },
      body: '{"targetType":"content","targetId":39,"reason":3}'
    });
    expect(result.report.duplicate).toBe(duplicate);
  });

  it('throws a structured API error', async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({
        code: 503,
        message: 'busy',
        error: 'report_busy'
      })
    });

    await expect(
      reportVolunteerTarget({
        targetType: 'comment',
        targetId: 12,
        reason: VolunteerReportReason.OFFENSIVE
      })
    ).rejects.toMatchObject({
      status: 503,
      errorCode: 'report_busy'
    });
  });

  it('maps fetch failures to a network error', async () => {
    (globalThis.fetch as jest.Mock).mockRejectedValue(new TypeError('offline'));

    await expect(
      reportVolunteerTarget({
        targetType: 'space',
        targetId: 2,
        reason: VolunteerReportReason.SPAM
      })
    ).rejects.toEqual(expect.any(VolunteerReportError));
  });
});
