import { consts, texts } from '../../config';
import { QUERY_TYPES } from '../../queries';
import { ScreenName } from '../../types';
import { mainImageOfMediaContents } from '../imageHelper';

const { ROOT_ROUTE_NAMES } = consts;

const parseSuePriorities = (data) => {
  return data?.map((item) => ({
    priorityCode: item.priority_code,
    priorityName: item.priority_name
  }));
};

const parseSueRequests = (data) => {
  return data?.map((item) => {
    let parsedMediaUrl = [];
    try {
      const mediaArray = item?.mediaUrl || JSON.parse(item?.media_url);
      parsedMediaUrl = mediaArray.map((mediaItem) => ({
        id: mediaItem.id,
        sourceUrl: { url: mediaItem.url },
        visible: mediaItem.visible,
        contentType: 'image'
      }));
    } catch (error) {
      console.error('Error parsing media_url:', error);
    }

    if (item?.mediaUrl?.length) {
      return {
        ...item,
        routeName: ScreenName.Detail,
        params: {
          title: item.title,
          query: QUERY_TYPES.SUE.REQUESTS_WITH_SERVICE_REQUEST_ID,
          queryVariables: { id: item.serviceRequestId },
          rootRouteName: ROOT_ROUTE_NAMES.SUE,
          bookmarkable: false,
          details: item
        },
        picture: { url: mainImageOfMediaContents(parsedMediaUrl) }
      };
    }

    return {
      address: item?.address,
      agencyResponsible: item?.agency_responsible,
      description: item?.description,
      email: item?.email,
      firstName: item?.first_name,
      lastName: item?.last_name,
      params: {
        details: item,
        query: QUERY_TYPES.SUE.REQUESTS_WITH_SERVICE_REQUEST_ID,
        queryVariables: { id: item.service_request_id },
        rootRouteName: ROOT_ROUTE_NAMES.SUE,
        title: item?.title
      },
      picture: { url: mainImageOfMediaContents(parsedMediaUrl) },
      position: { longitude: item?.long, latitude: item?.lat },
      priorityCode: item?.priority_code,
      priorityName: item?.priority_name,
      requestedDateTime: item?.requested_datetime,
      serviceCode: item?.service_code,
      serviceName: item?.service_name,
      serviceRequestId: item.service_request_id,
      status: item?.status,
      routeName: ScreenName.Detail,
      title: item?.title,
      updatedDateTime: item?.updated_datetime,
      zipcode: item?.zipcode
    };
  });
};

const parseSueService = (data) => {
  return data?.map((item) => ({
    serviceCode: item?.service_code,
    serviceName: item?.service_name,
    metadata: item?.metadata,
    type: item?.type
  }));
};

const parseSueStatuses = (data) => {
  return data?.map((item) => ({
    statusCode: item?.status_code,
    statusName: item?.status_name
  }));
};

export const sueParser = (query: string, data: any) => {
  if (!data) return [];

  switch (query) {
    case QUERY_TYPES.SUE.PRIORITIES:
      return parseSuePriorities(data);
    case QUERY_TYPES.SUE.REQUESTS:
    case QUERY_TYPES.SUE.REQUESTS_WITH_SERVICE_REQUEST_ID:
      return parseSueRequests(data);
    case QUERY_TYPES.SUE.SERVICES:
      return parseSueService(data);
    case QUERY_TYPES.SUE.STATUSES:
      return parseSueStatuses(data);
    default:
      return data;
  }
};
