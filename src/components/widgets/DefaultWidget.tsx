import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { consts, IconProps, IconUrl, normalize } from '../../config';
import { Image } from '../Image';
import { BoldText } from '../Text';
import { WrapperRow } from '../Wrapper';
import { normalizeStyleValues } from '../../helpers';

import { WidgetContent } from './WidgetContent';
import { omitResponsiveDimensions } from './WidgetLayoutContext';

const WIDGET_ICON_SIZE = 24;

type Props = {
  accessibilityLabel?: string;
  count?: number | string;
  Icon: (props: IconProps) => JSX.Element;
  image?: {
    height?: number;
    uri: string;
    width?: number;
  };
  onPress: () => void;
  svg?: string;
  text: string;
  widgetStyle?: {
    fontStyle?: unknown;
    iconStyle?: unknown;
    widgetStyle?: unknown;
  };
};

type WidgetVisualProps = Pick<Props, 'Icon' | 'count' | 'image' | 'svg'> & {
  iconStyle: IconProps['style'];
};

type WidgetIconStyle = {
  color?: string;
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
};

const WidgetVisual = ({ Icon, count, iconStyle, image, svg }: WidgetVisualProps) => {
  const { color, fillColor, strokeColor, strokeWidth } = (iconStyle || {}) as WidgetIconStyle;
  const themedIconProps = { color, fillColor, strokeColor, strokeWidth };
  const visualStyle = [!!count?.toString() && styles.iconWithCount, iconStyle];
  const iconSize = normalize(WIDGET_ICON_SIZE);

  return (
    <WrapperRow center>
      {image?.uri ? (
        <Image
          source={image}
          style={{
            height: normalize(image?.height ?? 24),
            width: normalize(image?.width ?? 30)
          }}
        />
      ) : svg ? (
        <IconUrl
          iconName={svg}
          isMonochrome
          size={iconSize}
          style={visualStyle}
          {...themedIconProps}
        />
      ) : (
        <Icon size={iconSize} style={visualStyle} {...themedIconProps} />
      )}
      {count !== undefined && (
        <BoldText primary big>
          {count}
        </BoldText>
      )}
    </WrapperRow>
  );
};

export const DefaultWidget = ({
  accessibilityLabel,
  Icon,
  count,
  onPress,
  text,
  image,
  svg,
  widgetStyle
}: Props) => {
  const { fontStyle, iconStyle, widgetStyle: customWidgetStyle } = widgetStyle || {};
  const baseAccessibilityLabel = accessibilityLabel ?? text;
  const buttonAccessibilityLabel = baseAccessibilityLabel.includes(consts.a11yLabel.button)
    ? baseAccessibilityLabel
    : `${baseAccessibilityLabel} ${consts.a11yLabel.button}`;

  const normalizedFontStyle = normalizeStyleValues(fontStyle);
  const normalizedIconStyle = normalizeStyleValues(iconStyle);
  const normalizedWidgetStyle = omitResponsiveDimensions(normalizeStyleValues(customWidgetStyle));

  return (
    <TouchableOpacity
      accessibilityLabel={buttonAccessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      style={[normalizedWidgetStyle, styles.button]}
    >
      <WidgetContent
        label={text}
        labelStyle={normalizedFontStyle}
        visual={
          <WidgetVisual
            Icon={Icon}
            count={count}
            iconStyle={normalizedIconStyle}
            image={image}
            svg={svg}
          />
        }
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'stretch',
    justifyContent: 'center',
    minHeight: 48,
    width: '100%'
  },
  iconWithCount: {
    paddingRight: normalize(8)
  }
});
