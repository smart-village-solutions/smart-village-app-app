import { Share } from 'react-native';

import appJson from '../../app.json';
import { consts } from '../config';
import { QUERY_TYPES } from '../queries';

import { mergeWebUrls } from './linkHelper';
import { momentFormat } from './momentHelper';

const { HOST_NAMES } = consts;

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
  const webUrls = data.sourceUrl ? (data.webUrls || []).concat(data.sourceUrl) : data.webUrls;

  const urls = mergeWebUrls({
    webUrls,
    contact: data.contact,
    contacts: data.contacts
  })?.map(({ url }) => `Link: ${url}`);

  const urlSection = urls.length ? urls.join('\n') : '';
  const spacer = urlSection ? '\n' : '';

  /* eslint-disable complexity */
  const buildMessage = (query) => {
    let message = data.title;

    switch (query) {
      case QUERY_TYPES.EVENT_RECORD:
        message = `${momentFormat(data.listDate)} | ${
          data.addresses?.[0]?.addition || data.addresses?.[0]?.city
        }: ${data.title}`;
        break;
      case QUERY_TYPES.NEWS_ITEM:
        message = `${momentFormat(data.publishedAt)} | ${data.dataProvider?.name}: ${
          data.contentBlocks?.[0]?.title
        }`;
        break;
      case QUERY_TYPES.POINT_OF_INTEREST:
      case QUERY_TYPES.TOUR:
        message = `${data.category?.name}: ${data.name || data.title}`;
        break;
      case QUERY_TYPES.VOLUNTEER.CALENDAR:
      case QUERY_TYPES.VOLUNTEER.GROUP:
        message = data.subtitle ? `${data.subtitle}: ${data.title}` : data.title;
        break;
    }

    return `${message}${spacer}${urlSection ? `\n${urlSection}` : ''}`;
  };
  /* eslint-enable complexity */

  const buildSource = (query) => {
    return `Quelle: ${appJson.expo.scheme}://${HOST_NAMES.DETAIL}?query=${query}&id=${data.id}`;
  };

  return `${buildMessage(query)}\n\n${buildSource(query)}`;
};
