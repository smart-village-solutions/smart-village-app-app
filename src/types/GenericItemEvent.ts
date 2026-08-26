import { Address } from './Address';
import { GenericType } from './GenericType';
import { ScreenName } from './Navigation';

export type GenericItemEventSource = {
  genericType: GenericType | string;
  filterTypes?: string[];
  filterStatuses?: string[];
};

export type GenericItemEventListItem = {
  id: string;
  addresses?: Address[];
  color?: string;
  listDate: string;
  overtitle?: string;
  params: Record<string, unknown>;
  picture: { url?: string };
  routeName: ScreenName;
  startTime?: string;
  subtitle?: string;
  title: string;
};
