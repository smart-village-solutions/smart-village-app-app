import React, { ReactNode, useCallback, useContext, useState } from 'react';
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

const LIST_VISUAL_GAP = 12;
const LIST_MIN_VISUAL_WIDTH = 72;

const canFitListContent = (containerWidth: number, visualWidth: number, wordWidth: number) =>
  wordWidth > 0 &&
  visualWidth > 0 &&
  Math.max(visualWidth, normalize(LIST_MIN_VISUAL_WIDTH)) +
    normalize(LIST_VISUAL_GAP) +
    wordWidth <=
    containerWidth;

export const WidgetContent = ({ label, labelStyle, visual }: Props) => {
  const { mode, onLabelWidth } = useContext(WidgetLayoutContext);
  const [containerWidth, setContainerWidth] = useState(0);
  const [visualWidth, setVisualWidth] = useState(0);
  const [wordWidth, setWordWidth] = useState(0);
  const isList = mode === 'list' && canFitListContent(containerWidth, visualWidth, wordWidth);
  const measureLabel = useCallback(
    ({ nativeEvent }: NativeSyntheticEvent<TextLayoutEventData>) => {
      const wordWidth = Math.max(0, ...nativeEvent.lines.map((line) => line.width));
      if (Number.isFinite(wordWidth) && wordWidth > 0) {
        const measuredWidth = Math.ceil(wordWidth) + 1;
        setWordWidth(measuredWidth);
        onLabelWidth?.(measuredWidth + 2 * normalize(4));
      }
    },
    [onLabelWidth]
  );

  return (
    <View
      onLayout={({ nativeEvent }) => setContainerWidth(nativeEvent.layout.width)}
      style={[styles.container, isList && styles.listContainer]}
    >
      {(onLabelWidth || mode === 'list') && (
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
        onLayout={({ nativeEvent }) => setVisualWidth(nativeEvent.layout.width)}
        style={[
          styles.visualRow,
          { minHeight: normalize(48) },
          isList && styles.listVisualRow,
          isList && {
            marginRight: normalize(LIST_VISUAL_GAP),
            minWidth: normalize(LIST_MIN_VISUAL_WIDTH)
          }
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
    alignItems: 'center',
    flexShrink: 0,
    maxWidth: '100%'
  }
});
