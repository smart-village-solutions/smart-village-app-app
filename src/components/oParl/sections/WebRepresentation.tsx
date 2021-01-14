import React, { useCallback } from 'react';
import { NavigationScreenProp } from 'react-navigation';

import { texts } from '../../../config';
import { BoldText, RegularText } from '../../Text';
import { Touchable } from '../../Touchable';
import { WrapperRow } from '../../Wrapper';

type Props = {
  name: string;
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

  return (
    <WrapperRow>
      <BoldText>{texts.oparl.webRepresentation}</BoldText>
      <Touchable onPress={onPress}>
        <RegularText primary>{web}</RegularText>
      </Touchable>
    </WrapperRow>
  );
};
