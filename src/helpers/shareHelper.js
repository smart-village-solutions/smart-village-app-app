import { Share } from 'react-native';

import appJson from '../../app.json';
import { QUERY_TYPES } from '../queries';

import { mergeWebUrls } from './linkHelper';
import { momentFormat } from './momentHelper';

// https://facebook.github.io/react-native/docs/share
/**
 * @param {{ title?: string; message: string; } | { title?: string; url: string; }} shareContent
 */
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

export const shareMessage = (data, query) => {
  const urls = mergeWebUrls({
    webUrls: data.webUrls,
    contact: data.contact,
    contacts: data.contacts
  })?.map(({ url }) => `\nLink: ${url}`);

  // eslint-disable-next-line complexity
  const buildMessage = (query) => {
    switch (query) {
      case QUERY_TYPES.EVENT_RECORD:
        return `${momentFormat(data.listDate)} | ${
          data.addresses?.[0]?.addition || data.addresses?.[0]?.city
        }: ${data.title}${urls && `\n${urls}`}`;
      case QUERY_TYPES.NEWS_ITEM:
        return `${momentFormat(data.publishedAt)} | ${data.dataProvider?.name}: ${
          data.contentBlocks?.[0]?.title
        }${urls && `\n${urls}`}`;
      case QUERY_TYPES.POINT_OF_INTEREST:
        return `${data.category?.name}: ${data.name}${urls && `\n${urls}`}`;
      case QUERY_TYPES.TOUR:
        return `${data.category?.name}: ${data.name}${urls && `\n${urls}`}`;
      case QUERY_TYPES.VOLUNTEER.CALENDAR:
      case QUERY_TYPES.VOLUNTEER.GROUP:
        return data.subtitle ? `${data.subtitle}: ${data.title}` : data.title;
      default:
        return data.title;
    }
  };

  return `${buildMessage(query)}\n\nQuelle: ${appJson.expo.name}`;
};
