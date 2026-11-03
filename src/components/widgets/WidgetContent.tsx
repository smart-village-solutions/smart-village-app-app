import React, { ReactNode, useCallback, useContext } from 'react';
import {
  NativeSyntheticEvent,
  StyleProp,
  StyleSheet,
  TextLayoutEventData,
  TextStyle,
  View
} from 'react-native';

import { normalize } from '../../config';
import { RegularText } from '../Text';
import { WrapperRow } from '../Wrapper';

import { WidgetLayoutContext } from './WidgetLayoutContext';

type Props = {
  label: string;
  labelStyle?: StyleProp<TextStyle>;
  visual: ReactNode;
};

export const WidgetContent = ({ label, labelStyle, visual }: Props) => {
  const { mode, onLabelWidth } = useContext(WidgetLayoutContext);
  const isList = mode === 'list';
  const measureLabel = useCallback(
    ({ nativeEvent }: NativeSyntheticEvent<TextLayoutEventData>) => {
      const wordWidth = Math.max(0, ...nativeEvent.lines.map((line) => line.width));
      if (Number.isFinite(wordWidth) && wordWidth > 0) {
        onLabelWidth?.(Math.ceil(wordWidth) + 1 + 2 * normalize(4));
      }
    },
    [onLabelWidth]
  );

  return (
    <View
      style={[
        styles.container,
        { paddingHorizontal: normalize(4), paddingVertical: normalize(16) },
        isList && styles.listContainer,
        isList && { minHeight: normalize(64), paddingHorizontal: normalize(12) }
      ]}
    >
      {onLabelWidth && (
        <View
          accessible={false}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          pointerEvents="none"
          style={styles.measurement}
        >
          <RegularText primary small style={[styles.label, labelStyle]} onTextLayout={measureLabel}>
            {label.trim().split(/\s+/).join('\n')}
          </RegularText>
        </View>
      )}
      <WrapperRow
        center
        style={[
          styles.visualRow,
          isList ? { minHeight: normalize(48) } : { height: normalize(48) },
          isList && styles.listVisualRow,
          isList && { marginRight: normalize(12), minWidth: normalize(72) }
        ]}
      >
        {visual}
      </WrapperRow>
      <View
        style={[
          styles.labelContainer,
          { marginTop: normalize(4) },
          isList && styles.listLabelContainer
        ]}
      >
        <RegularText primary small style={[styles.label, isList && styles.listLabel, labelStyle]}>
          {label}
        </RegularText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%'
  },
  // Measure each word with the same font and scaling, independently of the current column width.
  measurement: {
    opacity: 0,
    position: 'absolute',
    width: 10000
  },
  label: {
    flexShrink: 1,
    textAlign: 'center'
  },
  labelContainer: {
    alignItems: 'center',
    width: '100%'
  },
  listContainer: {
    flexDirection: 'row'
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
    flexShrink: 0
  },
  visualRow: {
    alignItems: 'center'
  }
});
