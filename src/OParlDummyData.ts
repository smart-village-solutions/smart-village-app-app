import {
  AgendaItemData,
  BodyData,
  ConsultationData,
  FileData,
  LegislativeTermData,
  LocationData,
  MeetingData,
  MembershipData,
  OParlObjectType,
  OrganizationData,
  PaperData,
  PersonData,
  SystemData
} from './types';

const AI1: AgendaItemData = { type: OParlObjectType.AgendaItem, id: 'AI1' };
const AI2: AgendaItemData = { type: OParlObjectType.AgendaItem, id: 'AI2' };
const AI3: AgendaItemData = { type: OParlObjectType.AgendaItem, id: 'AI3' };

const LT1: LegislativeTermData = {
  id: 'LT1',
  type: OParlObjectType.LegislativeTerm,
  startDate: new Date('2020-12')
};

const B1: BodyData = {
  type: OParlObjectType.Body,
  id: 'B1',
  legislativeTerm: [LT1],
  meeting: [],
  name: 'Hyrule Council',
  organization: [],
  paper: [],
  person: []
};

const C1: ConsultationData = {
  id: 'C1',
  type: OParlObjectType.Consultation
};

const F1: FileData = {
  id: 'F1',
  type: OParlObjectType.File,
  accessUrl: 'access.me'
};

const F2: FileData = {
  id: 'F2',
  type: OParlObjectType.File,
  accessUrl: 'access.me'
};

const L1: LocationData = {
  id: 'L1',
  type: OParlObjectType.Location
};

const M1: MeetingData = {
  id: 'M1',
  type: OParlObjectType.Meeting
};

const M2: MeetingData = {
  id: 'M2',
  type: OParlObjectType.Meeting
};

const Me1: MembershipData = {
  id: 'Me1',
  type: OParlObjectType.Membership
};

const Me2: MembershipData = {
  id: 'Me2',
  type: OParlObjectType.Membership
};

const Me3: MembershipData = {
  id: 'Me2',
  type: OParlObjectType.Membership
};

const Me4: MembershipData = {
  id: 'Me2',
  type: OParlObjectType.Membership
};

const O1: OrganizationData = {
  id: 'O1',
  type: OParlObjectType.Organization
};

const O2: OrganizationData = {
  id: 'O2',
  type: OParlObjectType.Organization
};

const Pa1: PaperData = {
  id: 'Pa1',
  type: OParlObjectType.Paper
};

const Pe1: PersonData = {
  id: 'Pe1',
  type: OParlObjectType.Person
};

const Pe2: PersonData = {
  id: 'Pe2',
  type: OParlObjectType.Person
};

const Pe3: PersonData = {
  id: 'Pe3',
  type: OParlObjectType.Person
};

const Pe4: PersonData = {
  id: 'Pe4',
  type: OParlObjectType.Person
};

const S1: SystemData = {
  id: 'S1',
  type: OParlObjectType.System,
  body: [B1],
  oparlVersion: '1.0',
  contactEmail: 'm@il.me',
  contactName: 'me'
};

AI1.auxilaryFile = [F1, F2];
AI1.consultation = C1;
AI1.end = new Date('14:00');
AI1.keyword = ['First', 'Important'];
AI1.meeting = M1;
AI1.name = 'Lunch';
AI1.number = '1.';
AI1.public = false;
AI1.resolutionFile = F1;
AI1.resolutionText = 'Was Tasty';
AI1.result = 'Empty plate.';
AI1.start = new Date('12:00');
AI1.web = 'amazingBurgersEvery.where';

AI2.id = 'AI2';
AI2.type = OParlObjectType.AgendaItem;
AI2.keyword = ['First', 'Important'];
AI2.meeting = M1;
AI2.name = 'Dinner';
AI2.number = '2.';
AI2.resolutionText = 'Was Tasty';
AI2.result = 'Empty plate.';
AI2.start = new Date('17:45');

AI3.id = 'AI3';
AI3.type = OParlObjectType.AgendaItem;
AI3.keyword = ['Trial', 'Important'];
AI3.meeting = M2;
AI3.name = 'Dinner';
AI3.number = '2.';
AI3.resolutionText = 'Judged as guilty.';
AI3.result = 'Exiled Ganon.';
AI3.start = new Date('17:45');

B1.legislativeTerm = [LT1];
B1.meeting = [M1, M2];
B1.name = 'Hyrule Council';
B1.organization = [O1, O2];
B1.paper = [Pa1];
B1.person = [Pe1, Pe2, Pe3, Pe4];
B1.type = OParlObjectType.Body;
B1.ags = 'H';
B1.classification = 'Council';
B1.contactEmail = 'zelda@hyrule.hr';
B1.contactName = 'Zelda Hyrule';
B1.created = new Date('February 21, 1986');
B1.equivalent = ['https://en.wikipedia.org/wiki/The_Legend_of_Zelda'];
B1.license = 'OpenTriforce';
B1.licenseValidSince = new Date('February 21, 1986');
B1.location = L1;
B1.shortName = 'Hyrulers';
B1.oparlSince = new Date();
B1.system = S1;
B1.website = 'https://en.wikipedia.org/wiki/The_Legend_of_Zelda';

LT1.id = 'LT1';
LT1.type = OParlObjectType.LegislativeTerm;
LT1.body = B1;
LT1.endDate = new Date('2021-02');
LT1.name = 'Ganon';
LT1.keyword = ['Tyranny'];
LT1.startDate = new Date('2020-12');

C1.id = 'C1';
C1.type = OParlObjectType.Consultation;
C1.agendaItem = AI1;
C1.authoritative = true;
C1.meeting = M2;
C1.organization = [O1];
C1.paper = Pa1;
C1.role = 'Trial';

F1.accessUrl = 'access.me';
F1.id = 'F1';
F1.type = OParlObjectType.File;
F1.agendaItem = [AI1, AI2];
F1.date = new Date('2022-08-25');
F1.derivativeFile = [F2];
F1.downloadUrl = 'download.me';
F1.externalServiceUrl = 'exter.nal';
F1.fileLicense = 'Free';
F1.fileName = 'Fantastical_File.odt';
F1.masterFile = F2;
F1.meeting = [M1, M2];
F1.mimeType = '.odt';
F1.name = 'Fantastical File';
F1.sha1Checksum = '42';
F1.size = 13371337;
F1.text = 'Fantastical Content';

F2.accessUrl = 'access.me';
F2.id = 'F2';
F2.type = OParlObjectType.File;
F2.meeting = [M2];
F2.name = 'Trial= Ganon';
F2.sha1Checksum = '42';
F2.size = 13371337;
F2.text = 'Judgement= Repeated defeat by hero.';

L1.id = 'L1';
L1.type = OParlObjectType.Location;
L1.bodies = [B1];
L1.created = new Date('1999-10-2');
L1.description = 'Castle Hyrule';
L1.geoJson = { type: 'Point', coordinates: [45.600167, 16.925141] };
L1.keyword = ['Must see!'];
L1.locality = 'Hyrule';
L1.postalCode = 'H-001';
L1.meeting = [M1];
L1.organization = [O1];
L1.papers = [Pa1];
L1.room = 'Throne Room';
L1.streetAddress = 'Castle 1';
L1.subLocality = 'Hyrule City';

M1.id = 'M1';
M1.type = OParlObjectType.Meeting;
M1.agendaItem = [AI1, AI2];
M1.auxiliaryFile = [F1];
M1.cancelled = true;
M1.created = new Date('2020-01-01');
M1.deleted = true;
M1.invitation = F1;
M1.location = L1;
M1.end = new Date('20:00');
M1.meetingState = 'cancelled';
M1.modified = new Date('2020-01-21');
M1.name = 'Eating like the princess.';
M1.organization = [O1];
M1.participant = [Pe1, Pe2];
M1.resultsProtocol = F2;
M1.start = new Date('12:00');
M1.verbatimProtocol = F2;

M2.id = 'M2';
M2.type = OParlObjectType.Meeting;
M2.agendaItem = [AI3];
M2.auxiliaryFile = [F2];
M2.cancelled = true;
M2.created = new Date('08:00');
M2.deleted = true;
M2.invitation = F2;
M2.location = L1;
M2.modified = new Date('2020-01-21');
// eslint-disable-next-line prettier/prettier
M2.name= 'Ganon\'s trial.';
M2.organization = [O1];
M2.participant = [Pe1, Pe4];
M2.resultsProtocol = F2;
M2.start = new Date('12:00');
M2.verbatimProtocol = F2;

Me1.id = 'Me1';
Me1.type = OParlObjectType.Membership;
Me1.startDate = new Date('1996-02-02');
Me1.onBehalfOf = O2;
Me1.organization = O1;
Me1.person = Pe2;
Me1.role = 'Royalty';
Me1.votingRight = true;

Me2.id = 'Me2';
Me2.type = OParlObjectType.Membership;
Me2.startDate = new Date('1996-02-02');
Me2.organization = O1;
Me2.person = Pe1;
Me2.role = 'Royalty';
Me2.votingRight = true;

Me3.id = 'Me3';
Me3.type = OParlObjectType.Membership;
Me3.startDate = new Date('1996-02-02');
Me3.organization = O2;
Me3.person = Pe3;
Me3.role = 'Hero';
Me3.votingRight = false;

Me4.id = 'Me4';
Me4.type = OParlObjectType.Membership;
Me4.startDate = new Date('1996-02-02');
Me4.organization = O2;
Me4.person = Pe2;
Me4.role = 'Leadership';
Me4.votingRight = false;

O1.id = 'O1';
O1.type = OParlObjectType.Organization;
O1.body = B1;
O1.classification = 'Faction';
O1.created = new Date('1980');
O1.location = L1;
O1.meeting = [M1, M2];
O1.membership = [Me1, Me2];
O1.name = 'Royal Family';
O1.organizationType = 'Family';
O1.post = ['Leadership'];

O2.id = 'O2';
O2.type = OParlObjectType.Organization;
O2.body = B1;
O2.classification = 'Faction';
O2.created = new Date('1980');
O2.location = L1;
O2.meeting = [M1, M2];
O2.membership = [Me3, Me4];
O2.name = 'Temple of Time';
O2.organizationType = 'Council';
O2.post = ['Advisory'];
O2.subOrganizationOf = O1;

Pa1.id = 'Pa1';
Pa1.type = OParlObjectType.Paper;
Pa1.auxiliaryFile = [F2];
Pa1.body = B1;
Pa1.consultation = [C1];
Pa1.mainFile = F1;
Pa1.location = [L1];

Pe1.id = 'Pe1';
Pe1.type = OParlObjectType.Person;
Pe1.affix = 'the Best';
Pe1.body = B1;
Pe1.familyName = 'Hyrule';
Pe1.formOfAddress = 'His Majesty';
Pe1.gender = 'male';
Pe1.givenName = 'Rhoam Bosphoramus';
Pe1.membership = [Me1];
Pe1.name = 'King Rhoam Bosphoramus Hyrule';
Pe1.status = ['deceased'];
Pe1.title = ['King'];

Pe2.id = 'Pe2';
Pe2.type = OParlObjectType.Person;
Pe2.body = B1;
Pe2.familyName = 'Hyrule';
Pe2.formOfAddress = 'Her Majesty';
Pe2.gender = 'female';
Pe2.givenName = 'Zelda';
Pe2.membership = [Me2];
Pe2.title = ['Princess'];

Pe3.id = 'Pe3';
Pe3.type = OParlObjectType.Person;
Pe3.body = B1;
Pe3.gender = 'male';
Pe3.givenName = 'Link';
Pe3.membership = [Me3];

Pe4.id = 'Pe4';
Pe4.type = OParlObjectType.Person;
Pe4.body = B1;
Pe4.givenName = 'Ganon';
Pe4.title = ['Calamity'];

// TODO: Remove
export const DummyData = {
  [OParlObjectType.AgendaItem]: AI1,
  [OParlObjectType.Body]: B1,
  [OParlObjectType.Consultation]: C1,
  [OParlObjectType.File]: F1,
  [OParlObjectType.LegislativeTerm]: LT1,
  [OParlObjectType.Location]: L1,
  [OParlObjectType.Meeting]: M1,
  [OParlObjectType.Membership]: Me1,
  [OParlObjectType.Organization]: O1,
  [OParlObjectType.Paper]: Pa1,
  [OParlObjectType.Person]: Pe1,
  [OParlObjectType.System]: S1
};
