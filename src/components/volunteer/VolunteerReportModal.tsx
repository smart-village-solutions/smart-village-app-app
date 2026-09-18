import React, { useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { Overlay } from 'react-native-elements';
import { useMutation } from 'react-query';

import { normalize, texts } from '../../config';
import { volunteerReportErrorTextKey, volunteerReportReasons } from '../../helpers';
import { reportVolunteerTarget } from '../../queries/volunteer';
import { VolunteerReportReason, VolunteerReportTarget } from '../../types';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import { Button } from '../Button';
import { Radiobutton } from '../Radiobutton';
import { BoldText, RegularText } from '../Text';
import { Wrapper, WrapperRow } from '../Wrapper';

const reasonText = {
  [VolunteerReportReason.WRONG_SPACE]: texts.volunteer.report.reasons.wrongSpace,
  [VolunteerReportReason.OFFENSIVE]: texts.volunteer.report.reasons.offensive,
  [VolunteerReportReason.SPAM]: texts.volunteer.report.reasons.spam,
  [VolunteerReportReason.MISLEADING]: texts.volunteer.report.reasons.misleading
};

export const VolunteerReportModal = ({
  onClose,
  target
}: {
  onClose: () => void;
  target?: VolunteerReportTarget;
}) => {
  const styles = useThemeStyles(createStyles);
  const [reason, setReason] = useState<VolunteerReportReason>();
  const [errorKey, setErrorKey] = useState<ReturnType<typeof volunteerReportErrorTextKey>>();
  const { isLoading, mutate } = useMutation(reportVolunteerTarget, {
    onSuccess: ({ report }) => {
      Alert.alert(
        texts.volunteer.report.successTitle,
        report.duplicate
          ? texts.volunteer.report.duplicateMessage
          : texts.volunteer.report.successMessage
      );
      onClose();
    },
    onError: (error) => setErrorKey(volunteerReportErrorTextKey(error))
  });

  const close = () => {
    if (!isLoading) onClose();
  };

  const submit = () => {
    if (!target || reason === undefined || isLoading) return;

    setErrorKey(undefined);
    mutate({ targetType: target.targetType, targetId: target.targetId, reason });
  };

  return (
    <Overlay
      isVisible={!!target}
      onBackdropPress={close}
      overlayStyle={styles.overlay}
      supportedOrientations={['portrait', 'landscape']}
    >
      <View accessibilityViewIsModal importantForAccessibility="yes" style={styles.container}>
        <Wrapper>
          <BoldText accessibilityRole="header" center>
            {texts.volunteer.report.title}
          </BoldText>
          <RegularText small style={styles.reasonLabel}>
            {texts.volunteer.report.reasonLabel}
          </RegularText>
        </Wrapper>

        <ScrollView style={styles.options}>
          <View
            accessibilityLabel={texts.volunteer.report.reasonLabel}
            accessibilityRole="radiogroup"
          >
            {target &&
              volunteerReportReasons(target).map((value) => (
                <Radiobutton
                  key={value}
                  disabled={isLoading}
                  onPress={() => setReason(value)}
                  selected={reason === value}
                  title={reasonText[value]}
                />
              ))}
          </View>
          {!!errorKey && (
            <RegularText
              accessibilityLiveRegion="assertive"
              accessibilityRole="alert"
              center
              error
              small
              style={styles.error}
            >
              {texts.volunteer.report.errors[errorKey] || texts.volunteer.report.errors.generic}
            </RegularText>
          )}
          {isLoading && (
            <RegularText
              accessibilityLabel={texts.volunteer.report.sending}
              accessibilityLiveRegion="polite"
              accessibilityRole="progressbar"
              accessibilityValue={{ text: texts.volunteer.report.sending }}
              center
              small
              style={styles.status}
            >
              {texts.volunteer.report.sending}
            </RegularText>
          )}
        </ScrollView>

        <WrapperRow spaceAround>
          <Button
            accessibilityHint={texts.volunteer.report.cancelHint}
            disabled={isLoading}
            invert
            notFullWidth
            onPress={close}
            title={texts.volunteer.abort}
          />
          <Button
            accessibilityHint={texts.volunteer.report.submitHint}
            disabled={reason === undefined || isLoading}
            notFullWidth
            onPress={submit}
            title={isLoading ? texts.volunteer.report.sending : texts.volunteer.report.submit}
          />
        </WrapperRow>
      </View>
    </Overlay>
  );
};

const createStyles = (colors) => ({
  container: {
    maxHeight: '100%',
    minWidth: '100%'
  },
  reasonLabel: {
    alignSelf: 'flex-start',
    marginTop: normalize(8)
  },
  status: {
    marginTop: normalize(12)
  },
  error: {
    color: colors.error,
    marginTop: normalize(12)
  },
  options: {
    paddingHorizontal: normalize(16)
  },
  overlay: {
    backgroundColor: colors.surface,
    borderRadius: normalize(8),
    maxHeight: '90%',
    padding: 0,
    width: '95%'
  }
});
