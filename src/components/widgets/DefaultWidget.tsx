import React from 'react';
import { StyleSheet } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

import { IconProps, normalize } from '../../config';
import { BoldText, RegularText } from '../Text';
import { WrapperRow, WrapperVertical } from '../Wrapper';

type Props = {
  count?: number | string;
  Icon: (props: IconProps) => JSX.Element;
  onPress: () => void;
  text: string;
};

export const DefaultWidget = ({ Icon, count, onPress, text }: Props) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <WrapperVertical style={styles().container}>
        <WrapperRow center>
          <Icon style={styles(!!count?.toString()).icon} />
          <BoldText primary big>
            {count}
          </BoldText>
        </WrapperRow>
        <RegularText primary small>
          {text}
        </RegularText>
      </WrapperVertical>
    </TouchableOpacity>
  );
};

/* eslint-disable react-native/no-unused-styles */
/* this works properly, we do not want that warning */
const styles = (count?: boolean) =>
  StyleSheet.create({
    container: {
      alignItems: 'center'
    },
    icon: {
      paddingRight: count ? normalize(8) : 0,
      paddingBottom: normalize(3)
    }
  });
/* eslint-enable react-native/no-unused-styles */
