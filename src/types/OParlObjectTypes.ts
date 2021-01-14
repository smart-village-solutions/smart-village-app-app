export enum OParlObjectType {
  AgendaItem = 'https://schema.oparl.org/1.0/AgendaItem',
  Consultation = 'https://schema.oparl.org/1.0/Consultation',
  File = 'https://schema.oparl.org/1.0/File',
  LegislativeTerm = 'https://schema.oparl.org/1.0/LegislativeTerm',
  Meeting = 'https://schema.oparl.org/1.0/Meeting'
}

export type OParlObjectData = AgendaItemData | LegislativeTermData | MeetingData | FileData;

export type AgendaItemPreviewData = {
  id: string;
  type: OParlObjectType.AgendaItem;
  name?: string;
  number?: string;
  start?: Date;
};

export type AgendaItemData = {
  auxilaryFile?: FilePreviewData[];
  consultation?: ConsultationPreviewData;
  end?: Date;
  keyword?: string[];
  meeting?: MeetingPreviewData;
  public?: boolean;
  resolutionFile?: FilePreviewData;
  resolutionText?: string;
  result?: string;
  web?: string;
} & AgendaItemPreviewData;

export type ConsultationPreviewData = {
  id: string;
  type: OParlObjectType.Consultation;
  agendaItem?: AgendaItemPreviewData;
  meeting?: MeetingPreviewData;
  paper?: any;
};

export type ConsultationData = {
  authoritative?: boolean;
  keyword?: string[];
  organization?: any[];
  role?: string;
  web?: string;
} & ConsultationPreviewData;

export type FilePreviewData = {
  id: string;
  type: OParlObjectType.File;
  accessUrl: string;
  fileName?: string;
  name?: string;
  mimeType?: string;
  size?: number;
};

export type FileData = {
  agendaItem?: AgendaItemPreviewData[];
  date?: Date;
  derivativeFile?: FileData[];
  downloadUrl?: string;
  externalServiceUrl?: string;
  fileLicense?: string;
  masterFile?: FileData;
  meeting?: MeetingPreviewData[];
  sha1Checksum?: string;
  text?: string;
  web?: string;
} & FilePreviewData;

export type LegislativeTermData = {
  type: OParlObjectType.LegislativeTerm;
  body?: any;
  endDate?: Date;
  keyword?: string[];
  name?: string;
  startDate?: Date;
  web?: string;
};

export type MeetingPreviewData = {
  id: string;
  type: OParlObjectType.Meeting;
  cancelled?: boolean;
  name?: string;
  start?: Date;
};

export type MeetingData = {
  agendaItem?: AgendaItemPreviewData;
  auxiliaryFile?: FilePreviewData[];
  created?: Date;
  deleted?: boolean;
  end?: Date;
  invitation?: FilePreviewData;
  keyword: string[];
  location?: any;
  meetingState?: string;
  modified?: Date;
  organization?: any[];
  participant?: any[];
  resultsProtocol?: FilePreviewData;
  verbatimProtocol?: FilePreviewData;
  web?: string;
} & MeetingPreviewData;
