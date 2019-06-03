import { Share } from 'react-native';

import appJson from '../../app.json';
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

export const shareMessage = (data, query) => {
  const buildMessage = (query) => {
    switch (query) {
    case 'eventRecord':
      return `${momentFormat(data.createdAt)} | ${data.dataProvider && data.dataProvider.name}: ${
        data.title
      }`;
    case 'newsItem':
      return `${momentFormat(data.publishedAt)} | ${data.dataProvider &&
          data.dataProvider.name}: ${data.contentBlocks[0].title}`;
    case 'pointsOfInterest':
      return data.name;
    }
  };

  // TODO: real deep link instead of test
  return `[${appJson.expo.name}] ${buildMessage(query)}\n\n${appJson.expo.slug}://test`;
};
