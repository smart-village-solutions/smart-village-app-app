import { StackNavigationProp } from '@react-navigation/stack';
import React, { useCallback } from 'react';

import { texts } from '../../../config';
import { SimpleRow } from '../Row';

type Props = {
  name?: string;
  navigation: StackNavigationProp<any>;
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

  return <SimpleRow left={texts.oparl.webRepresentation} onPress={onPress} right={web} />;
};
