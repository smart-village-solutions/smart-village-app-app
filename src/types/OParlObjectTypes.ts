export enum OParlObjectType {
  AgendaItem = 'https://schema.oparl.org/1.0/AgendaItem',
  Consultation = 'https://schema.oparl.org/1.0/Consultation',
  File = 'https://schema.oparl.org/1.0/File',
  LegislativeTerm = 'https://schema.oparl.org/1.0/LegislativeTerm',
  Location = 'https://schema.oparl.org/1.0/Location',
  Meeting = 'https://schema.oparl.org/1.0/Meeting',
  Membership = 'https://schema.oparl.org/1.0/Membership',
  Organization = 'https://schema.oparl.org/1.0/Organization',
  Paper = 'https://schema.oparl.org/1.0/Paper',
  Person = 'https://schema.oparl.org/1.0/Person'
}

export type OParlObjectData =
  | AgendaItemData
  | FileData
  | LegislativeTermData
  | MeetingData
  | PaperData;

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
  paper?: PaperPreviewData;
};

export type ConsultationData = {
  authoritative?: boolean;
  keyword?: string[];
  organization?: OrganizationPreviewData[];
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

export type LocationPreviewData = {
  id: string;
  type: OParlObjectType.Location;
  deleted?: boolean;
  locality?: string;
  room?: string;
  streetAddress?: string;
  subLocality?: string;
};

export type LocationData = {
  bodies?: any[];
  created?: Date;
  description?: string;
  geoJson?: any; // https://en.wikipedia.org/wiki/GeoJSON
  keyword?: string[];
  meeting?: MeetingPreviewData[];
  modified?: Date;
  organization?: OrganizationPreviewData[];
  papers?: PaperPreviewData[];
  postalCode?: string;
  web?: string;
} & LocationPreviewData;

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
  organization?: OrganizationPreviewData[];
  participant?: PersonPreviewData[];
  resultsProtocol?: FilePreviewData;
  verbatimProtocol?: FilePreviewData;
  web?: string;
} & MeetingPreviewData;

export type MembershipPreviewData = {
  id: string;
  type: OParlObjectType.Membership;
  onBehalfOf?: OrganizationPreviewData;
  organization?: OrganizationPreviewData;
  person?: PersonPreviewData;
};

export type MembershipData = {
  endDate?: Date;
  keyword?: string[];
  role?: string;
  startDate?: Date;
  votingRight?: boolean;
  web?: string;
} & MeetingPreviewData;

export type OrganizationPreviewData = {
  id: string;
  type: OParlObjectType.Organization;
  classification?: string;
  deleted?: boolean;
  name?: string;
  shortName?: string;
};

export type OrganizationData = {
  body?: any;
  created?: Date;
  endDate?: Date;
  externalBody?: any;
  keyword?: string[];
  location?: any;
  meeting?: MeetingPreviewData[];
  membership?: MembershipPreviewData[];
  modified?: Date;
  organizationType?: string;
  post?: string[];
  startDate?: Date;
  subOrganizationOf?: OrganizationPreviewData;
  web?: string;
  website?: string;
};

export type PaperPreviewData = {
  id: string;
  type: OParlObjectType.Paper;
  deleted?: boolean;
  name?: string;
  reference?: string;
};

export type PaperData = {
  auxiliaryFile?: FilePreviewData[];
  body?: any;
  consultation?: ConsultationPreviewData[];
  created?: Date;
  date?: Date;
  keyword?: string[];
  location?: any[];
  mainFile?: FilePreviewData;
  modified?: Date;
  originatorOrganization?: OrganizationPreviewData[];
  originatorPerson?: PersonPreviewData[];
  paperType?: string;
  relatedPaper?: PaperPreviewData[];
  subordinatedPaper?: PaperPreviewData[];
  superordinatedPaper?: PaperPreviewData[];
  underDirectionOf?: OrganizationPreviewData[];
  web?: string;
} & PaperPreviewData;

export type PersonPreviewData = {
  id: string;
  type: OParlObjectType.Person;
  affix?: string;
  deleted?: boolean;
  familyName?: string;
  formOfAddress?: string;
  givenName?: string;
  name?: string;
  title?: string[];
};

export type PersonData = {
  body?: any;
  created?: Date;
  email?: string[];
  gender?: string;
  keyword?: string[];
  life?: string;
  lifeSource?: string;
  location?: any;
  membership?: MembershipPreviewData[];
  modified?: Date;
  phone?: string[];
  status?: string[];
  web?: string;
} & PersonPreviewData;
