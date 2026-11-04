import _upperFirst from 'lodash/upperFirst';
import React, { useContext } from 'react';
import { View } from 'react-native';

import { ConfigurationsContext } from '../../ConfigurationsProvider';
import { Icon, device, normalize, texts } from '../../config';
import { getSueTags } from '../../helpers/sueHelper';
import { BoldText, RegularText } from '../Text';
import { WrapperRow } from '../Wrapper';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import { useTheme } from '../../hooks/useTheme';

/* eslint-disable complexity */
export const SueStatus = ({
  disabled,
  iconName,
  isFilter,
  small = false,
  status = '',
  tagName
}: {
  disabled?: boolean;
  iconName?: string;
  isFilter?: boolean;
  small?: boolean;
  status?: string;
  tagName?: unknown;
}) => {
  const { colors: colors } = useTheme();

  const styles = useThemeStyles(createStyles);
  const { appDesignSystem = {} } = useContext(ConfigurationsContext);
  const { sueStatus = {} } = appDesignSystem;
  const {
    containerStyle = {},
    statusBorderColors = {},
    statusTextColors = {},
    statusTextColorsFilter = {},
    statusViewColors = {},
    statusViewColorsFilter = {},
    textStyle = {}
  } = sueStatus;

  const backgroundColor =
    isFilter && disabled
      ? statusViewColorsFilter?.disabled
      : isFilter
      ? statusViewColorsFilter?.enabled
      : disabled
      ? statusViewColors?.disabled
      : statusViewColors?.[status];

  let borderColor = colors.primary;

  if (isFilter && disabled) {
    borderColor = colors.placeholder;
  } else if (!isFilter) {
    borderColor = disabled
      ? statusBorderColors?.disabled || colors.primary
      : statusBorderColors?.[status] || colors.primary;
  }

  const textColor =
    isFilter && disabled
      ? statusTextColorsFilter?.disabled
      : isFilter
      ? statusTextColorsFilter?.enabled
      : disabled
      ? statusTextColors?.disabled
      : statusTextColors?.[status];

  const tags = getSueTags(tagName);

  const statusIconName = `Sue${_upperFirst(iconName)}${small ? 'Small' : ''}`;
  const StatusIcon = Icon[statusIconName as keyof typeof Icon];

  const statusBadge = !!status && (
    <WrapperRow
      style={[
        styles.container,
        !!containerStyle && containerStyle,
        small && styles.smallContainer,
        { backgroundColor, borderColor },
        isFilter && styles.filterContainer,
        !!tags.length && styles.tagStatus
      ]}
    >
      {!!iconName && (
        <StatusIcon
          accessibilityLabel={
            disabled
              ? `${texts.components.sueStatus.inactive} ${status}`
              : `${texts.components.sueStatus.active} ${status}`
          }
          color={textColor}
          size={small ? normalize(12) : normalize(16)}
          style={small ? styles.smallMarginRight : styles.marginRight}
        />
      )}
      <BoldText
        smallest
        style={[
          !!textStyle && textStyle,
          small && styles.smallFontSize,
          !!tags.length && styles.tagStatusText,
          { color: textColor }
        ]}
      >
        {status}
      </BoldText>
    </WrapperRow>
  );

  if (!tags.length) return statusBadge;

  return (
    <View style={styles.tagsRow}>
      <View style={styles.tags}>
        {tags.map((tag, index) => (
          <View key={`${index}-${tag}`} style={[styles.tag, { borderColor: colors.primary }]}>
            <RegularText smallest>{tag}</RegularText>
          </View>
        ))}
      </View>
      {statusBadge}
    </View>
  );
};
/* eslint-enable complexity */

const createStyles = () => ({
  tagsRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    columnGap: normalize(12),
    marginHorizontal: normalize(14),
    marginTop: normalize(7),
    marginBottom: normalize(14)
  },

  tags: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: normalize(6)
  },

  tag: {
    borderRadius: normalize(8),
    borderWidth: 1,
    maxWidth: '100%',
    paddingHorizontal: normalize(4),
    paddingVertical: normalize(4)
  },

  tagStatus: {
    flexShrink: 1,
    maxWidth: '50%',
    marginBottom: 0,
    marginRight: 0,
    marginTop: 0
  },

  tagStatusText: {
    flexShrink: 1
  },

  container: {
    alignItems: 'center',
    alignSelf: 'flex-end',
    borderRadius: normalize(22),
    justifyContent: 'center',
    marginBottom: normalize(14),
    marginRight: normalize(14),
    marginTop: normalize(7),
    paddingHorizontal: normalize(14),
    paddingVertical: normalize(4)
  },

  filterContainer: {
    borderRadius: normalize(8),
    borderWidth: normalize(1),
    height: normalize(32),
    width: device.width * 0.3
  },

  smallContainer: {
    borderRadius: normalize(28),
    marginBottom: 0,
    marginRight: 0,
    marginTop: 0
  },

  marginRight: {
    marginRight: normalize(6)
  },

  smallFontSize: {
    fontSize: normalize(9)
  },

  smallMarginRight: {
    marginRight: normalize(4)
  }
});
