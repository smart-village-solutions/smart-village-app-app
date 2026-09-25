import {
  volunteerReportErrorTextKey,
  volunteerReportReasons
} from '../../src/helpers/volunteerReportHelper';
import { VolunteerReportError, VolunteerReportReason } from '../../src/types';

describe('volunteerReportReasons', () => {
  it('includes wrong space for content with a confirmed space context', () => {
    expect(volunteerReportReasons({ targetType: 'content', isInSpace: true })).toEqual([
      VolunteerReportReason.WRONG_SPACE,
      VolunteerReportReason.OFFENSIVE,
      VolunteerReportReason.SPAM,
      VolunteerReportReason.MISLEADING
    ]);
  });

  it.each(['user', 'space'] as const)('omits wrong space for %s targets', (targetType) => {
    expect(volunteerReportReasons({ targetType, isInSpace: true })).toEqual([
      VolunteerReportReason.OFFENSIVE,
      VolunteerReportReason.SPAM,
      VolunteerReportReason.MISLEADING
    ]);
  });

  it('omits wrong space when the content container type is unknown', () => {
    expect(volunteerReportReasons({ targetType: 'comment' })).not.toContain(
      VolunteerReportReason.WRONG_SPACE
    );
  });
});

describe('volunteerReportErrorTextKey', () => {
  it.each([
    [0, 'network'],
    [401, 'authentication'],
    [403, 'forbidden'],
    [404, 'notFound'],
    [422, 'invalid'],
    [503, 'unavailable'],
    [500, 'generic']
  ])('maps status %s to %s', (status, key) => {
    expect(volunteerReportErrorTextKey(new VolunteerReportError('failed', status))).toBe(key);
  });
});
