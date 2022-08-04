export enum PARTICIPANT_TYPE {
  REMOVE,
  DECLINE,
  MAYBE,
  ACCEPT
}

export type VolunteerCalendar = {
  allDay: number;
  allowDecline: number;
  allowMaybe: number;
  color?: string;
  contentContainerId: number;
  description?: string;
  documents?: string;
  endDate: string;
  endTime?: string;
  entranceFee?: string;
  forceJoin: number;
  images?: string;
  isPublic: number;
  location?: string;
  maxParticipants: string;
  organizer?: string;
  participantInfo: string;
  participationMode: number;
  startDate: string;
  startTime?: string;
  timeZone: string;
  title: string;
  topics?: [number];
};
