import { LocationObjectCoords } from 'expo-location';

import { ContentBlock } from './ContentBlock';
import { Address } from './Address';
import { Contact } from './Contact';
import { DataProvider } from './DataProvider';
import { SVA_Date } from './Date';
import { MediaContent } from './MediaContent';
import { OpeningHour } from './OpeningHour';
import { WebUrl } from './WebUrl';

// HINT: This type is not complete. Only the currently used fields have been added.
export type GenericItem<T = unknown> = {
  author?: string;
  addresses?: Address[];
  categories: Array<{ id?: string | number; name?: string }>;
  companies?: Array<{
    address?: Address;
    contact?: Contact;
    name?: string;
  }>;
  contacts?: Contact[];
  contentBlocks: ContentBlock[];
  createdAt?: string;
  dataProvider?: DataProvider;
  dates: SVA_Date[];
  description?: string;
  externalId?: string;
  genericType?: string;
  id: string;
  locations?: Array<{
    name?: string;
    geoLocation?: LocationObjectCoords;
  }>;
  mediaContents: MediaContent[];
  openingHours?: OpeningHour[];
  payload: T;
  publicationDate?: string;
  publishedAt?: string;
  settings?: {
    displayOnlySummary?: string;
    onlySummaryLinkText?: string;
  };
  teaser?: string;
  title?: string;
  updatedAt?: string;
  webUrls: WebUrl[];
};

export type ConstructionSitePayload = {
  direction?: string;
  cause?: string;
  restrictions?: Array<{
    description: string;
  }>;
};
