import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { IconProps, normalize } from '../../config';
import { Image } from '../Image';
import { BoldText, RegularText } from '../Text';
import { WrapperRow, WrapperVertical } from '../Wrapper';
import { normalizeStyleValues } from '../../helpers';

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
  widgetStyle?: {
    fontStyle?: any;
    iconStyle?: any;
    widgetStyle?: any;
  };
};

export const DefaultWidget = ({ Icon, count, onPress, text, image, widgetStyle }: Props) => {
  const { fontStyle, iconStyle, widgetStyle: customWidgetStyle } = widgetStyle || {};

  const normalizedFontStyle = normalizeStyleValues(fontStyle);
  const normalizedIconStyle = normalizeStyleValues(iconStyle);
  const normalizedWidgetStyle = normalizeStyleValues(customWidgetStyle);

  return (
    <TouchableOpacity onPress={onPress} style={normalizedWidgetStyle}>
      <WrapperVertical style={styles.container}>
        <WrapperRow center>
          {image?.uri ? (
            <Image
              source={image}
              style={{
                height: normalize(image?.height ?? 24),
                width: normalize(image?.width ?? 30)
              }}
            />
          ) : (
            <Icon style={[!!count?.toString() && styles.iconWithCount, normalizedIconStyle]} />
          )}
          {count !== undefined && (
            <BoldText primary big>
              {count}
            </BoldText>
          )}
        </WrapperRow>
        <RegularText primary small style={normalizedFontStyle}>
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
