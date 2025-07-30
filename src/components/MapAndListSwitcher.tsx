import _upperFirst from 'lodash/upperFirst';
import React from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';

import { colors, consts, Icon, normalize } from '../config';
import { SUE_VIEW_TYPE, SueViewType } from '../screens';

import { RegularText } from './Text';
import { WrapperRow } from './Wrapper';

export const MapAndListSwitcher = ({
  containerStyle,
  viewType,
  setViewType
}: {
  containerStyle?: ViewStyle;
  viewType: SueViewType;
  setViewType: (viewType: SueViewType) => void;
}) => {
  return (
    <WrapperRow
      style={[
        containerStyle,
        viewType === SUE_VIEW_TYPE.MAP && styles.mapViewContainer,
        viewType === SUE_VIEW_TYPE.LIST && styles.listViewContainer,
        styles.container
      ]}
    >
      {(Object.values(SUE_VIEW_TYPE) as SueViewType[]).map((type, index) => (
        <TouchableOpacity
          accessibilityLabel={`${_upperFirst(type)} ${consts.a11yLabel.button}`}
          activeOpacity={0.7}
          key={`${type}-${index}`}
          onPress={() => setViewType(type)}
          style={[
            styles.buttonContainer,
            {
              backgroundColor: viewType === type ? colors.primary : colors.secondary
            }
          ]}
        >
          <RegularText smallest lightest>
            {_upperFirst(type)}
          </RegularText>
          {type === SUE_VIEW_TYPE.MAP ? (
            <Icon.Map color={colors.surface} size={normalize(16)} style={styles.icon} />
          ) : (
            <Icon.List color={colors.surface} size={normalize(14)} style={styles.icon} />
          )}
        </TouchableOpacity>
      ))}
    </WrapperRow>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    alignItems: 'center',
    borderRadius: normalize(8),
    flexDirection: 'row',
    justifyContent: 'center',
    padding: normalize(16)
  },
  container: {
    backgroundColor: colors.secondary,
    borderRadius: normalize(8),
    position: 'absolute',
    zIndex: 1
  },
  icon: {
    marginLeft: normalize(6)
  },
  listViewContainer: {
    left: 0,
    top: 0
  },
  mapViewContainer: {
    left: normalize(16),
    top: normalize(16)
  }
});
