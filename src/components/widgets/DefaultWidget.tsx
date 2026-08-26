import React, { useContext } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { consts, IconProps, normalize } from '../../config';
import { Image } from '../Image';
import { BoldText, RegularText } from '../Text';
import { WrapperRow } from '../Wrapper';
import { normalizeStyleValues } from '../../helpers';

import { omitResponsiveDimensions, WidgetLayoutContext } from './WidgetLayoutContext';

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
  text: string;
  widgetStyle?: {
    fontStyle?: unknown;
    iconStyle?: unknown;
    widgetStyle?: unknown;
  };
};

type WidgetVisualProps = Pick<Props, 'Icon' | 'count' | 'image'> & {
  iconStyle: IconProps['style'];
  isList: boolean;
};

const WidgetVisual = ({ Icon, count, iconStyle, image, isList }: WidgetVisualProps) => (
  <WrapperRow center style={[styles.visualRow, isList && styles.listVisualRow]}>
    {image?.uri ? (
      <Image
        source={image}
        style={{
          height: normalize(image?.height ?? 24),
          width: normalize(image?.width ?? 30)
        }}
      />
    ) : (
      <Icon
        size={WIDGET_ICON_SIZE}
        style={[!!count?.toString() && styles.iconWithCount, iconStyle]}
      />
    )}
    {count !== undefined && (
      <BoldText primary big>
        {count}
      </BoldText>
    )}
  </WrapperRow>
);

export const DefaultWidget = ({
  accessibilityLabel,
  Icon,
  count,
  onPress,
  text,
  image,
  widgetStyle
}: Props) => {
  const { mode } = useContext(WidgetLayoutContext);
  const isList = mode === 'list';
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
      <View style={[styles.container, isList && styles.listContainer]}>
        <WidgetVisual
          Icon={Icon}
          count={count}
          iconStyle={normalizedIconStyle}
          image={image}
          isList={isList}
        />
        <View style={[styles.labelContainer, isList && styles.listLabelContainer]}>
          <RegularText
            primary
            small
            style={[styles.label, isList && styles.listLabel, normalizedFontStyle]}
          >
            {text}
          </RegularText>
        </View>
      </View>
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
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    paddingVertical: 16,
    width: '100%'
  },
  iconWithCount: {
    paddingRight: normalize(8)
  },
  label: {
    flexShrink: 1,
    textAlign: 'center'
  },
  labelContainer: {
    alignItems: 'center',
    marginTop: 4,
    width: '100%'
  },
  listContainer: {
    flexDirection: 'row',
    minHeight: 64,
    paddingHorizontal: 12
  },
  listLabel: {
    textAlign: 'left'
  },
  listLabelContainer: {
    alignItems: 'flex-start',
    flex: 1,
    marginTop: 0,
    width: 'auto'
  },
  listVisualRow: {
    marginRight: 12,
    minWidth: 72
  },
  visualRow: {
    alignItems: 'center',
    minHeight: 44
  }
});
