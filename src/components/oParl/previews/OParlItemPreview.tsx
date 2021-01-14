import React, { useCallback } from 'react';
import { NavigationScreenProp } from 'react-navigation';

import { Touchable } from '../../Touchable';
import { WrapperRow } from '../../Wrapper';

type Props = {
  children: React.ReactNode;
  id: string;
  navigation: NavigationScreenProp<never>;
};

export const OParlItemPreview = ({ children, id, navigation }: Props) => {
  const onPress = useCallback(() => navigation.push('OParlDetail', { id }), [id, navigation]);

  return (
    <Touchable onPress={onPress}>
      <WrapperRow spaceBetween>{children}</WrapperRow>
    </Touchable>
  );
};
