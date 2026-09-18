import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { Icon, normalize, texts } from '../../config';
import { VolunteerReportTarget } from '../../types';
import { useTheme } from '../../hooks/useTheme';
import { RegularText } from '../Text';

import { useVolunteerReport } from './VolunteerReportContext';

export const VolunteerReportAction = ({
  target,
  variant = 'icon',
  withSeparator = false
}: {
  target: VolunteerReportTarget;
  variant?: 'detail' | 'icon' | 'text';
  withSeparator?: boolean;
}) => {
  const { colors } = useTheme();
  const { enabled, openReport } = useVolunteerReport();

  if (!enabled) return null;

  const actionStyle = variant === 'icon' ? styles.iconButton : styles.detailButton;
  const action = (
    <TouchableOpacity
      accessibilityHint={texts.volunteer.report.actionHint}
      accessibilityLabel={texts.volunteer.report.action(target.label)}
      accessibilityRole="button"
      hitSlop={normalize(12)}
      onPress={() => openReport(target)}
      style={variant === 'text' ? undefined : actionStyle}
    >
      {variant === 'icon' || variant === 'detail' ? (
        <>
          <Icon.Flag
            color={variant === 'detail' ? colors.primary : colors.darkText}
            size={normalize(20)}
          />
          {variant === 'detail' && (
            <RegularText primary>{texts.volunteer.report.action(target.label)}</RegularText>
          )}
        </>
      ) : (
        <RegularText small>{texts.volunteer.report.label}</RegularText>
      )}
    </TouchableOpacity>
  );

  return withSeparator ? (
    <>
      <RegularText small> • </RegularText>
      {action}
    </>
  ) : (
    action
  );
};

const styles = StyleSheet.create({
  detailButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: normalize(12),
    justifyContent: 'flex-start',
    minHeight: normalize(48),
    paddingVertical: normalize(16),
    width: '100%'
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: normalize(44),
    minWidth: normalize(44)
  }
});
