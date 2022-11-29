import { consts, texts } from '../config';
import { GenericType } from '../types';

export const getGenericItemSectionTitle = (genericType: GenericType): string => {
  switch (genericType) {
    case GenericType.Commercial:
      return texts.commercial.commercials;
    case GenericType.Job:
      return texts.job.jobs;
    case GenericType.Noticeboard:
      return texts.noticeboard.noticeboard;
    default:
      return '';
  }
};

export const getGenericItemDetailTitle = (genericType: GenericType): string => {
  switch (genericType) {
    case GenericType.Commercial:
      return texts.commercial.commercial;
    case GenericType.Job:
      return texts.job.job;
    case GenericType.Noticeboard:
      return texts.noticeboard.noticeboard;
    default:
      return '';
  }
};

const { ROOT_ROUTE_NAMES } = consts;

export const getGenericItemRootRouteName = (genericType: GenericType): string => {
  switch (genericType) {
    case GenericType.Commercial:
      return ROOT_ROUTE_NAMES.COMMERCIALS;
    case GenericType.Job:
      return ROOT_ROUTE_NAMES.JOBS;
    case GenericType.Noticeboard:
      return ROOT_ROUTE_NAMES.NOTICEBOARD;
    default:
      return '';
  }
};
