import { LocationObjectCoords } from 'expo-location';

import { ContentBlock } from './ContentBlock';
import { DataProvider } from './DataProvider';
import { SVA_Date } from './Date';
import { MediaContent } from './MediaContent';
import { WebUrl } from './WebUrl';

// HINT: This type is not complete. Only the currently used fields have been added.
export type GenericItem<T = unknown> = {
  author?: string;
  categories: Array<{ name?: string }>;
  contentBlocks: ContentBlock[];
  createdAt?: string;
  dataProvider?: DataProvider;
  dates: SVA_Date[];
  externalId?: string;
  genericType?: string;
  id: string;
  locations?: Array<{
    name?: string;
    geoLocation?: LocationObjectCoords;
  }>;
  mediaContents: MediaContent[];
  payload: T;
  publicationDate?: string;
  publishedAt?: string;
  title?: string;
  webUrls: WebUrl[];
};

export type ConstructionSitePayload = {
  direction?: string;
  cause?: string;
  restrictions?: Array<{
    description: string;
  }>;
};
