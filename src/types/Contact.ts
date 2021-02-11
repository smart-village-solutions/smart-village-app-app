import { WebUrl } from './WebUrl';

export type Contact = {
  email?: string;
  fax?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  webUrls?: WebUrl[];
  www?: string;
};
