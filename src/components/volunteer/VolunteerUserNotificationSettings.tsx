import React, { useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { useMutation, useQuery } from 'react-query';

import { texts } from '../../config';
import { volunteerAuthToken } from '../../helpers';
import { useVolunteerRefresh } from '../../hooks';
import { QUERY_TYPES } from '../../queries';
import {
  storePushToken,
  userNotificationSettings,
  userNotificationSettingsUpdate
} from '../../queries/volunteer';
import { LoadingSpinner } from '../LoadingSpinner';
import { SectionHeader } from '../SectionHeader';
import { SettingsToggle } from '../SettingsToggle';
import { RegularText } from '../Text';
import { Wrapper, WrapperHorizontal } from '../Wrapper';

const keyExtractor = (item, index) => `index${index}-id${item.key}`;

const TARGET_MOBILE = 'mobile';

export const VolunteerUserNotificationSettings = () => {
  const {
    isLoading: isLoadingUserNotificationSettings,
    isError: isErrorUserNotificationSettings,
    isSuccess: isSuccessUserNotificationSettings,
    data: dataUserNotificationSettings,
    refetch: refetchUserNotificationSettings
  } = useQuery(QUERY_TYPES.VOLUNTEER.USER_NOTIFICATION_SETTINGS, userNotificationSettings);
  const { mutateAsync: mutateUserNotificationSettings } = useMutation(
    userNotificationSettingsUpdate
  );
  const { mutate: mutateStorePushToken } = useMutation(storePushToken);

  const { categories, settings } = dataUserNotificationSettings?.data || {};
  const mobileSettings = settings?.filter(
    ({ isEditable, target }) => isEditable && target === TARGET_MOBILE
  );

  useVolunteerRefresh(
    refetchUserNotificationSettings,
    QUERY_TYPES.VOLUNTEER.USER_NOTIFICATION_SETTINGS
  );

  const onUpdate = useCallback(
    ({ category, isEnabled, target }, revert) => {
      mutateUserNotificationSettings({
        category,
        isEnabled: !isEnabled,
        target
      }).then((response) => {
        if (response?.code === 200) {
          refetchUserNotificationSettings();
          volunteerAuthToken().then((authToken: string | null) => {
            !!authToken && mutateStorePushToken(authToken);
          });
        } else {
          revert?.();
        }
      });
    },
    [mutateUserNotificationSettings, refetchUserNotificationSettings, mutateStorePushToken]
  );

  if (isLoadingUserNotificationSettings) {
    return <LoadingSpinner loading />;
  }

  if (
    isErrorUserNotificationSettings ||
    (isSuccessUserNotificationSettings &&
      dataUserNotificationSettings?.status &&
      dataUserNotificationSettings?.status !== 200)
  ) {
    return (
      <Wrapper>
        <RegularText>{texts.volunteer.errorLoadingUserNotificationSettings}</RegularText>
      </Wrapper>
    );
  }

  return (
    <>
      <SectionHeader title={texts.volunteer.notificationsTitle} big center />

      {mobileSettings?.map((setting, index: number) => (
        <WrapperHorizontal key={keyExtractor(setting, index)}>
          <SettingsToggle
            item={{
              title:
                categories?.find((category) => category.id === setting.category)?.title ||
                setting.key,
              description:
                categories?.find((category) => category.id === setting.category)?.description ||
                setting.key,
              bottomDivider: true,
              topDivider: index !== 0,
              value: setting.isEnabled,
              onActivate: (revert) => onUpdate(setting, revert),
              onDeactivate: (revert) => onUpdate(setting, revert)
            }}
          />
        </WrapperHorizontal>
      ))}
    </>
  );
};

const styles = StyleSheet.create({});
