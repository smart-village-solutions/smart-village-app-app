import { Share } from 'react-native';

import appJson from '../../app.json';
import { QUERY_TYPES } from '../queries';
import { momentFormat } from './momentHelper';

// https://facebook.github.io/react-native/docs/share
export const openShare = async ({ message, title, url }) => {
  try {
    const result = await Share.share(
      {
        message,
        title,
        url // iOS only
      },
      {
        dialogTitle: 'Teilen', // Android only
        subject: title // iOS only - a subject to share via email
      }
    );

    if (result.action === Share.sharedAction) {
      if (result.activityType) {
        // shared with activity type of result.activityType
      } else {
        // shared
      }
    } else if (result.action === Share.dismissedAction) {
      // dismissed
    }
  } catch (error) {
    alert(error.message);
  }
};

/* eslint-disable complexity */
/* NOTE: we need to check a lot for presence, so this is that complex */
export const shareMessage = (data, query) => {
  const buildMessage = (query) => {
    switch (query) {
      case QUERY_TYPES.EVENT_RECORD:
        return `${momentFormat(data.listDate)} | ${
          data.addresses &&
          data.addresses.length &&
          (data.addresses[0].addition || data.addresses[0].city)
        }: ${data.title}`;
      case QUERY_TYPES.NEWS_ITEM:
        return `${momentFormat(data.publishedAt)} | ${
          data.dataProvider && data.dataProvider.name
        }: ${data.contentBlocks && data.contentBlocks.length && data.contentBlocks[0].title}`;
      case QUERY_TYPES.POINT_OF_INTEREST:
        return `${data.category && data.category.name}: ${data.name}`;
      case QUERY_TYPES.TOUR:
        return `${data.category && data.category.name}: ${data.name}`;
    }
  };

  return `${buildMessage(query)}\n\nQuelle: ${appJson.expo.name}`;
};
/* eslint-enable complexity */
