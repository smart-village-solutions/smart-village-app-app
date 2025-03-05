import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { IconProps, normalize } from '../../config';
import { Image } from '../Image';
import { BoldText, RegularText } from '../Text';
import { WrapperRow, WrapperVertical } from '../Wrapper';

type Props = {
  count?: number | string;
  Icon: (props: IconProps) => JSX.Element;
  image?: {
    height?: number;
    uri: string;
    width?: number;
  };
  onPress: () => void;
  text: string;
};

export const DefaultWidget = ({ Icon, count, onPress, text, image }: Props) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <WrapperVertical style={styles.container}>
        <WrapperRow center>
          {image?.uri ? (
            <Image
              source={image}
              childrenContainerStyle={{
                height: normalize(image?.height ?? 24),
                width: normalize(image?.width ?? 30)
              }}
            />
          ) : (
            <Icon style={[!!count?.toString() && styles.iconWithCount]} />
          )}
          {!!count && (
            <BoldText primary big>
              {count}
            </BoldText>
          )}
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
  iconWithCount: {
    paddingRight: normalize(8)
  }
});
