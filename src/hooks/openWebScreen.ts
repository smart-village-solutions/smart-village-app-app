import { useNavigation } from '@react-navigation/core';
import { useCallback } from 'react';

export const useOpenWebScreen = (title: string, link?: string, rootRouteName?: string) => {
  const navigation = useNavigation();

  const openWebScreen = useCallback(
    (webUrl) =>
      navigation.navigate({
        name: 'Web',
        params: {
          title: title,
          webUrl: !!webUrl && typeof webUrl === 'string' ? webUrl : link,
          rootRouteName
        }
      }),
    [title, link, navigation, rootRouteName]
  );

  return openWebScreen;
};
