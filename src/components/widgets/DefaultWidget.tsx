import React from 'react';
import { StyleSheet } from 'react-native';

import { normalize } from '../../config';
import { Icon } from '../Icon';
import { BoldText, RegularText } from '../Text';
import { Touchable } from '../Touchable';
import { WrapperRow, WrapperVertical } from '../Wrapper';

type Props = {
  icon: string;
  number?: number | string;
  onPress: () => void;
  text: string;
};

export const DefaultWidget = ({ icon, number, onPress, text }: Props) => {
  return (
    <Touchable onPress={onPress}>
      <WrapperVertical style={styles.container}>
        <WrapperRow center>
          <Icon style={styles.icon} xml={icon} />
          <BoldText primary big>
            {number ?? ' '}
          </BoldText>
        </WrapperRow>
        <RegularText primary small>
          {text}
        </RegularText>
      </WrapperVertical>
    </Touchable>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center'
  },
  icon: {
    paddingRight: normalize(8)
  }
});
