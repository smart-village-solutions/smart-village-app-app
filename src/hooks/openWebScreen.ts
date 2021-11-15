import { useNavigation } from '@react-navigation/core';
import { useCallback } from 'react';
import { ShareContent } from 'react-native';

export const useOpenWebScreen = (
  title: string,
  link?: string,
  rootRouteName?: string,
  shareContent?: ShareContent
) => {
  const navigation = useNavigation();

  const openWebScreen = useCallback(
    (webUrl: string, specificTitle?: string) =>
      navigation.navigate({
        name: 'Web',
        params: {
          title: specificTitle ?? title,
          webUrl: !!webUrl && typeof webUrl === 'string' ? webUrl : link,
          rootRouteName,
          shareContent
        }
      }),
    [title, link, navigation, rootRouteName]
  );

  return openWebScreen;
};
