import React, { useCallback } from 'react';
import { NavigationScreenProp } from 'react-navigation';

import { texts } from '../../../config';
import { LineEntry } from '../LineEntry';

type Props = {
  name?: string;
  navigation: NavigationScreenProp<never>;
  web?: string;
};

export const WebRepresentation = ({ name, navigation, web }: Props) => {
  const onPress = useCallback(
    () =>
      navigation.push('Web', {
        title: name,
        webUrl: web
      }),
    [name, navigation, web]
  );

  if (!web) {
    return null;
  }

  return <LineEntry left={texts.oparl.webRepresentation} onPress={onPress} right={web} />;
};
