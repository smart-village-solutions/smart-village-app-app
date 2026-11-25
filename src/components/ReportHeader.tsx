import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';

import { Icon, normalize, texts } from '../config';
import { VolunteerReportTarget } from '../types';
import { useHeaderForeground } from '../hooks/useHeaderForeground';

import { HeaderIconButton } from './HeaderIconButton';
import { useVolunteerReport } from './volunteer/VolunteerReportContext';

export const ReportHeader = ({
  style,
  target
}: {
  style?: StyleProp<ViewStyle>;
  target: VolunteerReportTarget;
}) => {
  const foreground = useHeaderForeground();
  const { enabled, openReport } = useVolunteerReport();

  if (!enabled) return null;

  return (
    <HeaderIconButton
      accessibilityHint={texts.volunteer.report.actionHint}
      accessibilityLabel={texts.volunteer.report.action(target.label)}
      onPress={() => openReport(target)}
      style={style}
    >
      <Icon.Flag color={foreground} size={normalize(22)} />
    </HeaderIconButton>
  );
};
