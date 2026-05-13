export type AreaId = string | number | undefined | null;

export type BusSettings = {
  apiKey?: string;
  areaId?: string | number;
  initialFilter?: string[];
  lifeSituationsRootSearchWord?: string;
  uri?: string;
};

export type BusCategoryServiceReference = {
  id?: string | number;
  name?: string | null;
};

export type BusCategoryImage = {
  fileSize?: string;
  mimeType?: string;
  name?: string;
  originalFileName?: string;
  source?: string;
  url?: string;
  height?: number;
  width?: number;
};

export type BusCategory = {
  description?: string | null;
  id?: string | number;
  image?: BusCategoryImage;
  name?: string | null;
  parentId?: string | number;
  position?: string | number;
  publicServiceTypes?: BusCategoryServiceReference[];
};

export type BusServiceListItem = {
  externalId?: string | number;
  id?: string | number;
  name?: string | null;
  teaser?: string | null;
};

export type BusType = {
  id?: string | number;
  key?: string;
  name?: string;
};

export type BusExternalLink = {
  name?: string;
  url?: string;
};

export type BusTextBlock = {
  type?: BusType;
  text?: string;
  externalLinks?: BusExternalLink[];
};

export type BusTextBlockContainer = {
  textBlock?: BusTextBlock;
  type?: BusType;
};

export type BusCommunication = {
  type?: BusType;
  value?: string;
};

export type BusAddress = {
  area?: {
    name?: string;
  };
  elevator?: boolean;
  houseNumber?: string;
  street?: string;
  wheelchairAccessible?: boolean;
  zipcode?: string;
};

export type BusFormLink = {
  name?: string;
  url?: string;
};

export type BusForm = {
  links?: BusFormLink[];
  name?: string;
};

export type BusOnlineService = {
  communications?: BusCommunication[];
  links?: BusFormLink[];
  name?: string;
  publicName?: string;
  title?: string;
  url?: string;
};

export type BusOrganisationalUnit = {
  addresses?: BusAddress[];
  communications?: BusCommunication[];
  forms?: BusForm[];
  id?: string | number;
  name?: string;
  openingHours?: string;
};

export type BusPerson = {
  addresses?: BusAddress[];
  communication?: BusCommunication[];
  department?: string;
  firstName?: string;
  id?: string | number;
  lastName?: string;
  position?: string;
  room?: string;
  title?: string;
};

export type BusServiceDetail = BusServiceListItem & {
  onlineServices?: BusOnlineService[];
  organisationalUnits?: BusOrganisationalUnit[];
  persons?: BusPerson[];
  textBlocks?: BusTextBlockContainer[];
};

export type PoliticalArea = {
  ags?: string;
  id?: string | number;
  label?: string;
};

export type BusAreaSearchResult = {
  id?: string | number;
  displayName?: string;
  name?: string;
  nameShort?: string;
};

export type BusSettingsContextValue = {
  globalSettings?: {
    settings?: {
      bus?: BusSettings;
    };
  };
};

export type BusServiceArgs = {
  areaId?: AreaId;
  id?: string | number | null;
};
