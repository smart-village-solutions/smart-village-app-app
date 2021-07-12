import { ContentBlock } from './ContentBlock';
import { DataProvider } from './DataProvider';
import { SVA_Date } from './Date';
import { MediaContent } from './MediaContent';
import { WebUrl } from './WebUrl';

// This type is not complete. Only the currently used fields have been added.
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
    geoLocation?: {
      latitude: number;
      longitude: number;
    };
  }>;
  mediaContents: MediaContent[];
  payload: T;
  publicationDate?: string;
  publishedAt?: string;
  title?: string;
  webUrls: WebUrl[];
};
