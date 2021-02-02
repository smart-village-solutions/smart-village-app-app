import React from 'react';
import { StyleSheet } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

import { normalize } from '../../config';
import { Icon } from '../Icon';
import { BoldText, RegularText } from '../Text';
import { WrapperRow, WrapperVertical } from '../Wrapper';

type Props = {
  icon: string;
  count?: number | string;
  onPress: () => void;
  text: string;
};

export const DefaultWidget = ({ icon, count, onPress, text }: Props) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <WrapperVertical style={styles.container}>
        <WrapperRow center>
          <Icon style={styles.icon} xml={icon} />
          <BoldText primary big>
            {count ?? ' '}
          </BoldText>
        </WrapperRow>
        <RegularText primary small>
          {text}
        </RegularText>
      </WrapperVertical>
    </TouchableOpacity>
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
