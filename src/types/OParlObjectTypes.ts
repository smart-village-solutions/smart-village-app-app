export enum OParlObjectType {
  AgendaItem = 'https://schema.oparl.org/1.0/AgendaItem',
  AgendaItem1 = 'https://schema.oparl.org/1.1/AgendaItem',
  Body = 'https://schema.oparl.org/1.0/Body',
  Body1 = 'https://schema.oparl.org/1.1/Body',
  Consultation = 'https://schema.oparl.org/1.0/Consultation',
  Consultation1 = 'https://schema.oparl.org/1.1/Consultation',
  File = 'https://schema.oparl.org/1.0/File',
  File1 = 'https://schema.oparl.org/1.1/File',
  LegislativeTerm = 'https://schema.oparl.org/1.0/LegislativeTerm',
  LegislativeTerm1 = 'https://schema.oparl.org/1.1/LegislativeTerm',
  Location = 'https://schema.oparl.org/1.0/Location',
  Location1 = 'https://schema.oparl.org/1.1/Location',
  Meeting = 'https://schema.oparl.org/1.0/Meeting',
  Meeting1 = 'https://schema.oparl.org/1.1/Meeting',
  Membership = 'https://schema.oparl.org/1.0/Membership',
  Membership1 = 'https://schema.oparl.org/1.1/Membership',
  Organization = 'https://schema.oparl.org/1.0/Organization',
  Organization1 = 'https://schema.oparl.org/1.1/Organization',
  Paper = 'https://schema.oparl.org/1.0/Paper',
  Paper1 = 'https://schema.oparl.org/1.1/Paper',
  Person = 'https://schema.oparl.org/1.0/Person',
  Person1 = 'https://schema.oparl.org/1.1/Person',
  System = 'https://schema.oparl.org/1.0/System',
  System1 = 'https://schema.oparl.org/1.1/System'
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
  type: OParlObjectType.AgendaItem | OParlObjectType.AgendaItem1;
  name?: string;
  number?: string;
  start?: Date;
};

export type AgendaItemData = {
  auxilaryFile?: FilePreviewData[];
  created?: Date;
  consultation?: ConsultationPreviewData;
  deleted?: boolean;
  end?: Date;
  keyword?: string[];
  license?: string;
  meeting?: MeetingPreviewData;
  modified?: Date;
  order?: number;
  public?: boolean;
  resolutionFile?: FilePreviewData;
  resolutionText?: string;
  result?: string;
  web?: string;
} & AgendaItemPreviewData;

export type BodyPreviewData = {
  id: string;
  type: OParlObjectType.Body | OParlObjectType.Body1;
  deleted?: boolean;
  name: string;
  shortName?: string;
};

export type BodyData = {
  agendaItem?: AgendaItemPreviewData[];
  ags?: string;
  classification?: string;
  consultation?: ConsultationPreviewData[];
  contactEmail?: string;
  contactName?: string;
  created?: Date;
  equivalent?: string[];
  file?: FilePreviewData[];
  keyword?: string[];
  legislativeTerm: LegislativeTermPreviewData[];
  legislativeTermList?: LegislativeTermPreviewData[];
  license?: string;
  licenseValidSince?: Date;
  location?: LocationPreviewData;
  locationList?: LocationPreviewData[];
  meeting: MeetingPreviewData[];
  membership?: MembershipPreviewData[];
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
  type: OParlObjectType.Consultation | OParlObjectType.Consultation1;
  agendaItem?: AgendaItemPreviewData;
  deleted?: boolean;
  meeting?: MeetingPreviewData;
  paper?: PaperPreviewData;
};

export type ConsultationData = {
  authoritative?: boolean;
  created?: Date;
  keyword?: string[];
  license?: string;
  modified?: Date;
  organization?: OrganizationPreviewData[];
  role?: string;
  web?: string;
} & ConsultationPreviewData;

export type FilePreviewData = {
  id: string;
  type: OParlObjectType.File | OParlObjectType.File1;
  accessUrl: string;
  deleted?: boolean;
  fileName?: string;
  name?: string;
  mimeType?: string;
  size?: number;
};

export type FileData = {
  agendaItem?: AgendaItemPreviewData[];
  created?: Date;
  date?: Date;
  derivativeFile?: FileData[];
  downloadUrl?: string;
  externalServiceUrl?: string;
  fileLicense?: string;
  license?: string;
  masterFile?: FileData;
  meeting?: MeetingPreviewData[];
  modified?: Date;
  sha1Checksum?: string;
  sha512Checksum?: string;
  text?: string;
  web?: string;
} & FilePreviewData;

export type LegislativeTermPreviewData = {
  id: string;
  type: OParlObjectType.LegislativeTerm | OParlObjectType.LegislativeTerm1;
  deleted?: boolean;
  endDate?: Date;
  name?: string;
  startDate?: Date;
};

export type LegislativeTermData = {
  body?: BodyPreviewData;
  created?: Date;
  keyword?: string[];
  license?: string;
  modified?: Date;
  web?: string;
} & LegislativeTermPreviewData;

export type LocationPreviewData = {
  id: string;
  type: OParlObjectType.Location | OParlObjectType.Location1;
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
  geoJson?: unknown; // https://en.wikipedia.org/wiki/GeoJSON
  keyword?: string[];
  license?: string;
  meeting?: MeetingPreviewData[];
  meetings?: MeetingPreviewData[];
  modified?: Date;
  organization?: OrganizationPreviewData[];
  organizations?: OrganizationPreviewData[];
  papers?: PaperPreviewData[];
  persons?: PersonPreviewData[];
  postalCode?: string;
  web?: string;
} & LocationPreviewData;

export type MeetingPreviewData = {
  id: string;
  type: OParlObjectType.Meeting | OParlObjectType.Meeting1;
  cancelled?: boolean;
  deleted?: boolean;
  name?: string;
  start?: Date;
};

export type MeetingData = {
  agendaItem?: AgendaItemPreviewData[];
  auxiliaryFile?: FilePreviewData[];
  created?: Date;
  end?: Date;
  invitation?: FilePreviewData;
  keyword?: string[];
  license?: string;
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
  type: OParlObjectType.Membership | OParlObjectType.Membership1;
  deleted?: boolean;
  onBehalfOf?: OrganizationPreviewData;
  organization?: OrganizationPreviewData;
  person?: PersonPreviewData;
};

export type MembershipData = {
  created?: Date;
  endDate?: Date;
  keyword?: string[];
  license?: string;
  modified?: Date;
  role?: string;
  startDate?: Date;
  votingRight?: boolean;
  web?: string;
} & MembershipPreviewData;

export type OrganizationPreviewData = {
  id: string;
  type: OParlObjectType.Organization | OParlObjectType.Organization1;
  classification?: string;
  deleted?: boolean;
  name?: string;
  shortName?: string;
};

export type OrganizationData = {
  body?: BodyPreviewData;
  consultation?: ConsultationPreviewData[];
  created?: Date;
  endDate?: Date;
  externalBody?: BodyPreviewData;
  keyword?: string[];
  license?: string;
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
  type: OParlObjectType.Paper | OParlObjectType.Paper1;
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
  license?: string;
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
  type: OParlObjectType.Person | OParlObjectType.Person1;
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
  license?: string;
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
  type: OParlObjectType.System | OParlObjectType.System1;
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
