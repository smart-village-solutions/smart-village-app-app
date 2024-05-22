import { consts, texts } from '../config';
import { GenericType } from '../types';

const { MATOMO_TRACKING, ROOT_ROUTE_NAMES } = consts;

export const getGenericItemSectionTitle = (genericType: GenericType): string => {
  switch (genericType) {
    case GenericType.Commercial:
      return texts.commercial.commercials;
    case GenericType.Deadline:
      return texts.deadline.deadlines;
    case GenericType.DefectReport:
      return texts.defectReport.defectReports;
    case GenericType.Job:
      return texts.job.jobs;
    case GenericType.Noticeboard:
      return texts.noticeboard.noticeboard;
    default:
      return '';
  }
};

export const getGenericItemDetailTitle = (
  genericType: GenericType,
  queryVariables: any,
  categoryName: string
): string => {
  switch (genericType) {
    case GenericType.Commercial:
      return texts.commercial.commercial;
    case GenericType.Deadline:
      return '';
    case GenericType.DefectReport:
      return texts.defectReport.defectReport;
    case GenericType.Job:
      return texts.job.job;
    case GenericType.Noticeboard: {
      if (queryVariables?.isCurrentUser) {
        return texts.noticeboard.myNoticeboard;
      }

      if (categoryName) {
        return categoryName;
      }

      return texts.noticeboard.noticeboard;
    }
    default:
      return '';
  }
};

export const getGenericItemRootRouteName = (genericType: GenericType): string => {
  switch (genericType) {
    case GenericType.Commercial:
      return ROOT_ROUTE_NAMES.COMMERCIALS;
    case GenericType.Deadline:
      return ROOT_ROUTE_NAMES.DEADLINES;
    case GenericType.DefectReport:
      return ROOT_ROUTE_NAMES.DEFECT_REPORT;
    case GenericType.Job:
      return ROOT_ROUTE_NAMES.JOBS;
    case GenericType.Noticeboard:
      return ROOT_ROUTE_NAMES.NOTICEBOARD;
    default:
      return '';
  }
};

export const getGenericItemMatomoName = (genericType: GenericType): string => {
  switch (genericType) {
    case GenericType.Commercial:
      return MATOMO_TRACKING.SCREEN_VIEW.COMMERCIAL_OFFER;
    case GenericType.Deadline:
      return MATOMO_TRACKING.SCREEN_VIEW.DEADLINE;
    case GenericType.DefectReport:
      return MATOMO_TRACKING.SCREEN_VIEW.DEFECT_REPORT;
    case GenericType.Job:
      return MATOMO_TRACKING.SCREEN_VIEW.JOB_OFFER;
    case GenericType.Noticeboard:
      return MATOMO_TRACKING.SCREEN_VIEW.NOTICEBOARD;
    default:
      return '';
  }
};

export const getGenericItemSubtitle = (genericItem: {
  genericType: GenericType;
  categories: [{ name: string }];
  dataProvider: { name: string };
}): string => {
  switch (genericItem.genericType) {
    case GenericType.Deadline:
      return genericItem.categories?.[0]?.name;
    case GenericType.Noticeboard:
      return '';
    default:
      return genericItem.dataProvider?.name;
  }
};
