import { Address } from './Address';
import { Contact } from './Contact';
import { WebUrl } from './WebUrl';

export type DataProvider = {
  address?: Address;
  contact?: Contact;
  dataType?: string;
  description?: string;
  id: string;
  logo?: WebUrl;
  name?: string;
};
