export enum PARTICIPANT_TYPE {
  REMOVE,
  DECLINE,
  MAYBE,
  ACCEPT
}

export type VolunteerCalendar = {
  title: string;
  description?: string;
  color?: string;
  location?: string;
  allDay: number;
  participationMode: number;
  maxParticipants: string;
  allowDecline: number;
  allowMaybe: number;
  participantInfo: string;
  isPublic: number;
  startDate: string;
  startTime?: string;
  endDate: string;
  endTime?: string;
  timeZone: string;
  forceJoin: number;
  topics?: [number];
  contentContainerId: number;
};
