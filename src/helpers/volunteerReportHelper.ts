import { VolunteerReportError, VolunteerReportReason, VolunteerReportTarget } from '../types';

export const volunteerReportReasons = ({
  isInSpace,
  targetType
}: Pick<VolunteerReportTarget, 'isInSpace' | 'targetType'>): VolunteerReportReason[] => {
  const reasons = [
    VolunteerReportReason.OFFENSIVE,
    VolunteerReportReason.SPAM,
    VolunteerReportReason.MISLEADING
  ];

  return isInSpace && (targetType === 'content' || targetType === 'comment')
    ? [VolunteerReportReason.WRONG_SPACE, ...reasons]
    : reasons;
};

export const volunteerReportErrorTextKey = (error: unknown) => {
  if (!(error instanceof VolunteerReportError)) return 'generic';

  if (error.status === 0) return 'network';
  if (error.status === 401) return 'authentication';
  if (error.status === 403) return 'forbidden';
  if (error.status === 404) return 'notFound';
  if (error.status === 422) return 'invalid';
  if (error.status === 503) return 'unavailable';

  return 'generic';
};
