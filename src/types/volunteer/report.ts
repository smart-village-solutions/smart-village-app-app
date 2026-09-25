export type VolunteerReportTargetType = 'content' | 'comment' | 'user' | 'space';

export enum VolunteerReportReason {
  WRONG_SPACE = 1,
  OFFENSIVE = 2,
  SPAM = 3,
  MISLEADING = 4
}

export type VolunteerReportTarget = {
  targetType: VolunteerReportTargetType;
  targetId: number;
  isInSpace?: boolean;
  label: string;
};

export type VolunteerReportRequest = Pick<VolunteerReportTarget, 'targetType' | 'targetId'> & {
  reason: VolunteerReportReason;
};

export type VolunteerReportResponse = {
  code: number;
  message: string;
  report: {
    id: number;
    targetType: VolunteerReportTargetType;
    targetId: number;
    reason: VolunteerReportReason;
    createdAt: string;
    duplicate: boolean;
  };
};

export class VolunteerReportError extends Error {
  status: number;
  errorCode?: string;

  constructor(message: string, status: number, errorCode?: string) {
    super(message);
    this.name = 'VolunteerReportError';
    this.status = status;
    this.errorCode = errorCode;
  }
}
