import { consts } from '../../config';
import { QUERY_TYPES } from '../../queries';
import { ScreenName } from '../../types';
import { mainImageOfMediaContents, parsedImageAspectRatio } from '../imageHelper';

const { ROOT_ROUTE_NAMES } = consts;

export const parseSueData = (data, query, appDesignSystem) => {
  const { sueStatus = {} } = appDesignSystem;
  const { statuses } = sueStatus;

  return data?.map((item) => {
    let parsedMediaUrl = [];

    if (item?.mediaUrl) {
      try {
        const mediaArray = item.mediaUrl || JSON.parse(item.media_url);
        parsedMediaUrl = mediaArray.map((mediaItem) => ({
          id: mediaItem.id,
          sourceUrl: { url: mediaItem.url },
          visible: mediaItem.visible,
          contentType: 'image'
        }));
      } catch (error) {
        console.error('Error parsing media_url:', error);
      }
    }

    const matchedStatus = statuses?.find((status) => status.matchingStatuses.includes(item.status));

    return {
      ...item,
      id: item.serviceRequestId,
      address: item.address?.replace('\r\n ', '\r\n'),
      aspectRatio: parsedImageAspectRatio('361:203'),
      bottomDivider: false,
      iconName: matchedStatus?.iconName,
      params: {
        title: `#${item.serviceRequestId} ${item.title}`,
        query:
          query === QUERY_TYPES.SUE.MY_REQUESTS
            ? QUERY_TYPES.SUE.MY_REQUEST_WITH_SERVICE_REQUEST_ID
            : QUERY_TYPES.SUE.REQUESTS_WITH_SERVICE_REQUEST_ID,
        queryVariables: { id: item.serviceRequestId },
        rootRouteName: ROOT_ROUTE_NAMES.SUE,
        bookmarkable: false,
        details: item
      },
      picture: { url: mainImageOfMediaContents(parsedMediaUrl) },
      routeName: ScreenName.Detail,
      status: matchedStatus?.status,
      subtitle: undefined,
      title: `#${item.serviceRequestId} ${item.title}`
    };
  });
};
