import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors as RNEColors } from 'react-native-elements';

import { colors, normalize } from '../../config';
import { arrowRight } from '../../icons';
import { Icon } from '../Icon';
import { BoldText, RegularText } from '../Text';
import { Touchable } from '../Touchable';
import { Wrapper, WrapperRow, WrapperWrap } from '../Wrapper';

type Props = {
  fullText?: boolean;
  left: string;
  lineThrough?: boolean;
  onPress?: () => void;
  right?: number | string;
  selectable?: boolean;
};

export const Line = ({
  left,
  right,
  topDivider,
  leftWidth = 100,
  fullText,
  onPress
}: {
  left: string;
  right?: string | JSX.Element;
  topDivider?: boolean;
  leftWidth?: number;
  fullText?: boolean;
  onPress?: () => void;
}) => {
  if (!right) return null;

  return (
    <Touchable onPress={onPress} disabled={!onPress}>
      <WrapperRow style={topDivider ? styles.doubleLine : styles.line}>
        <Wrapper shrink style={[styles.left, { width: normalize(leftWidth) }]}>
          <RegularText small numberOfLines={fullText ? undefined : 1}>
            {left}
          </RegularText>
        </Wrapper>
        <Wrapper shrink style={styles.right}>
          {typeof right === 'string' ? (
            <RegularText numberOfLines={fullText ? undefined : 1}>{right}</RegularText>
          ) : (
            right
          )}
        </Wrapper>
        {!!onPress && (
          <Wrapper style={styles.icon}>
            <Icon xml={arrowRight(colors.primary)} />
          </Wrapper>
        )}
      </WrapperRow>
    </Touchable>
  );
};

export const LineEntry = ({ fullText, left, lineThrough, onPress, right, selectable }: Props) => {
  if (!right || (typeof right === 'string' && !right?.length)) {
    return null;
  }

  const SelectedWrapper = fullText ? WrapperWrap : WrapperRow;

  const innerComponent = (
    <View style={styles.shrink}>
      <RegularText
        numberOfLines={fullText ? undefined : 1}
        lineThrough={lineThrough}
        primary={!!onPress}
        selectable={selectable}
      >
        {right}
      </RegularText>
    </View>
  );

  return (
    <SelectedWrapper style={styles.marginTop}>
      <BoldText>{left}</BoldText>
      {onPress ? (
        <Touchable style={styles.shrink} onPress={onPress}>
          {innerComponent}
        </Touchable>
      ) : (
        innerComponent
      )}
    </SelectedWrapper>
  );
};

const styles = StyleSheet.create({
  shrink: {
    flexShrink: 1
  },
  marginTop: {
    marginTop: normalize(12)
  },
  doubleLine: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: RNEColors.divider
  },
  icon: {
    justifyContent: 'center'
  },
  left: {
    justifyContent: 'center'
  },
  line: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: RNEColors.divider
  },
  right: {
    flex: 1,
    justifyContent: 'center'
  }
});
