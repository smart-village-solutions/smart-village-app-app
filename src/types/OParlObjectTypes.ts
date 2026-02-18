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

type Base = {
  id: string;
  type: OParlObjectType;
  created?: number; // Date
  modified?: number; // Date
  deleted?: boolean;
  keyword?: string[];
  web?: string;
  license?: string;
};

export type AgendaItemPreviewData = {
  type: OParlObjectType.AgendaItem | OParlObjectType.AgendaItem1;
  name?: string;
  number?: string;
  order?: number;
  start?: number; // Date
} & Base;

export type AgendaItemData = {
  auxilaryFile?: FilePreviewData[];
  consultation?: ConsultationPreviewData;
  end?: number; // Date
  meeting?: MeetingPreviewData;
  public?: boolean;
  resolutionFile?: FilePreviewData;
  resolutionText?: string;
  result?: string;
} & AgendaItemPreviewData;

export type BodyPreviewData = {
  type: OParlObjectType.Body | OParlObjectType.Body1;
  name: string;
  shortName?: string;
} & Base;

export type BodyData = {
  agendaItem?: AgendaItemPreviewData[];
  ags?: string;
  classification?: string;
  consultation?: ConsultationPreviewData[];
  contactEmail?: string;
  contactName?: string;
  equivalent?: string[];
  file?: FilePreviewData[];
  legislativeTerm: LegislativeTermPreviewData[];
  legislativeTermList?: LegislativeTermPreviewData[];
  licenseValidSince?: number; // Date
  location?: LocationPreviewData;
  locationList?: LocationPreviewData[];
  meeting: MeetingPreviewData[];
  membership?: MembershipPreviewData[];
  oparlSince?: number; // Date
  organization: OrganizationPreviewData[];
  paper: PaperPreviewData[];
  person: PersonPreviewData[];
  rgs?: string;
  system?: SystemPreviewData;
  website?: string;
} & BodyPreviewData;

export type ConsultationPreviewData = {
  type: OParlObjectType.Consultation | OParlObjectType.Consultation1;
  agendaItem?: AgendaItemPreviewData;
  meeting?: MeetingPreviewData;
  paper?: PaperPreviewData;
} & Base;

export type ConsultationData = {
  authoritative?: boolean;
  organization?: OrganizationPreviewData[];
  role?: string;
} & ConsultationPreviewData;

export type FilePreviewData = {
  type: OParlObjectType.File | OParlObjectType.File1;
  accessUrl: string;
  fileName?: string;
  name?: string;
  mimeType?: string;
  size?: number;
} & Base;

export type FileData = {
  agendaItem?: AgendaItemPreviewData[];
  date?: number; // Date
  derivativeFile?: FileData[];
  downloadUrl?: string;
  externalServiceUrl?: string;
  fileLicense?: string;
  masterFile?: FileData;
  meeting?: MeetingPreviewData[];
  sha1Checksum?: string;
  sha512Checksum?: string;
  text?: string;
} & FilePreviewData;

export type LegislativeTermPreviewData = {
  type: OParlObjectType.LegislativeTerm | OParlObjectType.LegislativeTerm1;
  endDate?: number; // Date
  name?: string;
  startDate?: number; // Date
} & Base;

export type LegislativeTermData = {
  body?: BodyPreviewData;
} & LegislativeTermPreviewData;

export type LocationPreviewData = {
  type: OParlObjectType.Location | OParlObjectType.Location1;
  locality?: string;
  postalCode?: string;
  room?: string;
  streetAddress?: string;
  subLocality?: string;
} & Base;

export type LocationData = {
  bodies?: BodyPreviewData[];
  description?: string;
  geoJson?: unknown; // https://en.wikipedia.org/wiki/GeoJSON
  meeting?: MeetingPreviewData[];
  meetings?: MeetingPreviewData[];
  organization?: OrganizationPreviewData[];
  organizations?: OrganizationPreviewData[];
  papers?: PaperPreviewData[];
  persons?: PersonPreviewData[];
} & LocationPreviewData;

export type MeetingPreviewData = {
  type: OParlObjectType.Meeting | OParlObjectType.Meeting1;
  cancelled?: boolean;
  name?: string;
  start?: number; // Date
} & Base;

export type MeetingData = {
  agendaItem?: AgendaItemPreviewData[];
  auxiliaryFile?: FilePreviewData[];
  conferenceLink?: string;
  end?: number; // Date
  invitation?: FilePreviewData;
  location?: LocationPreviewData;
  meetingState?: string;
  organization?: OrganizationPreviewData[];
  participant?: PersonPreviewData[];
  resultsProtocol?: FilePreviewData;
  verbatimProtocol?: FilePreviewData;
} & MeetingPreviewData;

export type MembershipPreviewData = {
  type: OParlObjectType.Membership | OParlObjectType.Membership1;
  onBehalfOf?: OrganizationPreviewData;
  organization?: OrganizationPreviewData;
  person?: Omit<PersonPreviewData, 'membership'>;
  endDate?: number; // Date
  startDate?: number; // Date
} & Base;

export type MembershipData = {
  role?: string;
  votingRight?: boolean;
} & MembershipPreviewData;

export type OrganizationPreviewData = {
  type: OParlObjectType.Organization | OParlObjectType.Organization1;
  classification?: string;
  name?: string;
  shortName?: string;
} & Base;

export type OrganizationData = {
  body?: BodyPreviewData;
  consultation?: ConsultationPreviewData[];
  endDate?: number; // Date
  externalBody?: BodyPreviewData;
  location?: LocationPreviewData;
  meeting?: MeetingPreviewData[];
  membership?: MembershipPreviewData[];
  organizationType?: string;
  post?: string[];
  startDate?: number; // Date
  subOrganizationOf?: OrganizationPreviewData;
  website?: string;
} & OrganizationPreviewData;

export type PaperPreviewData = {
  type: OParlObjectType.Paper | OParlObjectType.Paper1;
  name?: string;
  reference?: string;
} & Base;

export type PaperData = {
  auxiliaryFile?: FilePreviewData[];
  body?: BodyPreviewData;
  consultation?: ConsultationPreviewData[];
  date?: number; // Date
  location?: LocationPreviewData[];
  mainFile?: FilePreviewData;
  originatorOrganization?: OrganizationPreviewData[];
  originatorPerson?: PersonPreviewData[];
  paperType?: string;
  relatedPaper?: PaperPreviewData[];
  subordinatedPaper?: PaperPreviewData[];
  superordinatedPaper?: PaperPreviewData[];
  underDirectionOf?: OrganizationPreviewData[];
} & PaperPreviewData;

export type PersonPreviewData = {
  type: OParlObjectType.Person | OParlObjectType.Person1;
  affix?: string;
  familyName?: string;
  formOfAddress?: string;
  givenName?: string;
  membership?: Omit<MembershipPreviewData, 'person'>[];
  name?: string;
  title?: string[];
} & Base;

export type PersonData = {
  body?: BodyPreviewData;
  email?: string[];
  gender?: string;
  life?: string;
  lifeSource?: string;
  location?: LocationPreviewData;
  phone?: string[];
  status?: string[];
} & PersonPreviewData;

export type SystemPreviewData = {
  type: OParlObjectType.System | OParlObjectType.System1;
  name?: string;
  oparlVersion: string;
} & Base;

export type SystemData = {
  body: BodyPreviewData[];
  contactEmail?: string;
  contactName?: string;
  otherOparlVersion?: string[];
  product?: string;
  vendor?: string;
  website?: string;
} & SystemPreviewData;

export type OrganizationPeopleData = {
  id: string;
  type: OParlObjectType.Organization | OParlObjectType.Organization1;
  name?: string;
  shortName?: string;
  membership?: Array<{
    endDate?: number; // Date;
    person?: PersonPreviewData;
  }>;
};

export type OrganizationListData = OrganizationPreviewData & {
  id: string;
  type: OParlObjectType.Organization | OParlObjectType.Organization1;
  name?: string;
  shortName?: string;
  membership?: Array<{
    id: string;
    endDate?: number; // Date;
  }>;
};
