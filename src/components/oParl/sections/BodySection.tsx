import React, { useCallback } from 'react';
import { NavigationScreenProp } from 'react-navigation';

import { texts } from '../../../config';
import { BoldText, RegularText } from '../../Text';
import { Touchable } from '../../Touchable';
import { WrapperRow } from '../../Wrapper';

type Props = {
  body?: { id: string; name: string };
  navigation: NavigationScreenProp<never>;
};

export const BodySection = ({ body, navigation }: Props) => {
  const onPress = useCallback(
    () => body && navigation.push('OParlDetail', { id: body.id, title: body.name }),
    [navigation, body]
  );

  if (!body) {
    return null;
  }

  return (
    <WrapperRow>
      <BoldText>{texts.oparl.partOfBody}</BoldText>
      <Touchable onPress={onPress}>
        <RegularText primary>{body.name}</RegularText>
      </Touchable>
    </WrapperRow>
  );
};
