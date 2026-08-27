import React, { ReactNode, useContext } from 'react';
import { StyleProp, StyleSheet, TextStyle, View } from 'react-native';

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
  const { mode } = useContext(WidgetLayoutContext);
  const isList = mode === 'list';

  return (
    <View
      style={[
        styles.container,
        { paddingHorizontal: normalize(4), paddingVertical: normalize(16) },
        isList && styles.listContainer,
        isList && { minHeight: normalize(64), paddingHorizontal: normalize(12) }
      ]}
    >
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
