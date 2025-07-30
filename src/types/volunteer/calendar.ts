export enum PARTICIPANT_TYPE {
  REMOVE,
  DECLINE,
  MAYBE,
  ACCEPT
}

export type Calendar = {
  id: number;
  allDay: 0 | 1;
  allowDecline: number;
  allowMaybe: number;
  calendarId: number;
  color?: string;
  content?: {
    files: [
      {
        fileName: string;
        file_name: string;
        guid: string;
        id: number;
        mimeType: string;
        mime_type: string;
        size: string;
        url: string;
      }
    ];
    likes: {
      total: number;
    };
    topics: [
      {
        id: number;
        name: string;
      }
    ];
  };
  contentContainerId: number;
  description?: string;
  documents?: string;
  endDate: string;
  end_datetime: string;
  endTime?: string;
  forceJoin: number;
  images?: string;
  isPublic: number;
  location?: string;
  maxParticipants: string;
  participantInfo: string;
  participant_info: string;
  participationMode: number;
  startDate: string;
  start_datetime: string;
  startTime?: string;
  timeZone: string;
  title: string;
  topics?: [number];
};
