export enum OParlObjectType {
  AgendaItem = 'https://schema.oparl.org/1.0/AgendaItem',
  Body = 'https://schema.oparl.org/1.0/Body',
  Consultation = 'https://schema.oparl.org/1.0/Consultation',
  File = 'https://schema.oparl.org/1.0/File',
  LegislativeTerm = 'https://schema.oparl.org/1.0/LegislativeTerm',
  Location = 'https://schema.oparl.org/1.0/Location',
  Meeting = 'https://schema.oparl.org/1.0/Meeting',
  Membership = 'https://schema.oparl.org/1.0/Membership',
  Organization = 'https://schema.oparl.org/1.0/Organization',
  Paper = 'https://schema.oparl.org/1.0/Paper',
  Person = 'https://schema.oparl.org/1.0/Person',
  System = 'https://schema.oparl.org/1.0/System'
}

export type OParlObjectData =
  | AgendaItemData
  | BodyData
  | ConsultationData
  | FileData
  | LegislativeTermData
  | LocationData
  | MeetingData
  | MembershipData
  | OrganizationData
  | PaperData
  | PersonData
  | SystemData;

export type OParlObjectPreviewData =
  | AgendaItemPreviewData
  | BodyPreviewData
  | ConsultationPreviewData
  | FilePreviewData
  | LegislativeTermPreviewData
  | LocationPreviewData
  | MeetingPreviewData
  | MembershipPreviewData
  | OrganizationPreviewData
  | PaperPreviewData
  | PersonPreviewData
  | SystemPreviewData;

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

export type BodyPreviewData = {
  id: string;
  type: OParlObjectType.Body;
  deleted?: boolean;
  name: string;
  shortName?: string;
};

export type BodyData = {
  ags?: string;
  classification?: string;
  contactEmail?: string;
  contactName?: string;
  created?: Date;
  equivalent?: string[];
  keyword?: string[];
  legislativeTerm: LegislativeTermPreviewData[];
  license?: string;
  licenseValidSince?: Date;
  location?: LocationPreviewData;
  meeting: MeetingPreviewData[];
  modified?: Date;
  oparlSince?: Date;
  organization: OrganizationPreviewData[];
  paper: PaperPreviewData[];
  person: PersonPreviewData[];
  rgs?: string;
  system?: SystemPreviewData;
  web?: string;
  website?: string;
} & BodyPreviewData;

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

export type LegislativeTermPreviewData = {
  id: string;
  type: OParlObjectType.LegislativeTerm;
  endDate?: Date;
  name?: string;
  startDate?: Date;
};

export type LegislativeTermData = {
  body?: BodyPreviewData;
  keyword?: string[];
  web?: string;
} & LegislativeTermPreviewData;

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
  bodies?: BodyPreviewData[];
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
  agendaItem?: AgendaItemPreviewData[];
  auxiliaryFile?: FilePreviewData[];
  created?: Date;
  deleted?: boolean;
  end?: Date;
  invitation?: FilePreviewData;
  keyword: string[];
  location?: LocationPreviewData;
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
} & MembershipPreviewData;

export type OrganizationPreviewData = {
  id: string;
  type: OParlObjectType.Organization;
  classification?: string;
  deleted?: boolean;
  name?: string;
  shortName?: string;
};

export type OrganizationData = {
  body?: BodyPreviewData;
  created?: Date;
  endDate?: Date;
  externalBody?: BodyPreviewData;
  keyword?: string[];
  location?: LocationPreviewData;
  meeting?: MeetingPreviewData[];
  membership?: MembershipPreviewData[];
  modified?: Date;
  organizationType?: string;
  post?: string[];
  startDate?: Date;
  subOrganizationOf?: OrganizationPreviewData;
  web?: string;
  website?: string;
} & OrganizationPreviewData;

export type PaperPreviewData = {
  id: string;
  type: OParlObjectType.Paper;
  deleted?: boolean;
  name?: string;
  reference?: string;
};

export type PaperData = {
  auxiliaryFile?: FilePreviewData[];
  body?: BodyPreviewData;
  consultation?: ConsultationPreviewData[];
  created?: Date;
  date?: Date;
  keyword?: string[];
  location?: LocationPreviewData[];
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
  body?: BodyPreviewData;
  created?: Date;
  email?: string[];
  gender?: string;
  keyword?: string[];
  life?: string;
  lifeSource?: string;
  location?: LocationPreviewData;
  membership?: MembershipPreviewData[];
  modified?: Date;
  phone?: string[];
  status?: string[];
  web?: string;
} & PersonPreviewData;

export type SystemPreviewData = {
  id: string;
  type: OParlObjectType.System;
  deleted?: boolean;
  name?: string;
  oparlVersion: string;
};

export type SystemData = {
  body: BodyPreviewData[];
  contactEmail?: string;
  contactName?: string;
  created?: Date;
  license?: string;
  modified?: Date;
  otherOparlVersion?: SystemPreviewData[]; // TODO: check this is as we want it
  product?: string;
  vendor?: string;
  web?: string;
  website?: string;
} & SystemPreviewData;
