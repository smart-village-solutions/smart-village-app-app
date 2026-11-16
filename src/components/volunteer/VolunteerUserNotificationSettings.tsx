import React, { useCallback, useState } from 'react';
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

import { VolunteerStorageError } from './VolunteerStorageError';

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
  const { mutateAsync: mutateStorePushToken } = useMutation(storePushToken);
  const [syncError, setSyncError] = useState(false);
  const syncPushToken = useCallback(async () => {
    setSyncError(false);
    try {
      const authToken = await volunteerAuthToken();
      if (authToken) {
        const response = await mutateStorePushToken(authToken);
        if (!response?.ok) throw new Error('Push token synchronization failed');
      }
    } catch {
      // The settings update is already saved; retain it and allow token sync to be retried.
      setSyncError(true);
    }
  }, [mutateStorePushToken]);

  const { categories, settings } = dataUserNotificationSettings?.data || {};
  const mobileSettings = settings?.filter(
    ({ isEditable, target }) => isEditable && target === TARGET_MOBILE
  );

  useVolunteerRefresh(
    refetchUserNotificationSettings,
    QUERY_TYPES.VOLUNTEER.USER_NOTIFICATION_SETTINGS
  );

  const onUpdate = useCallback(
    async ({ category, isEnabled, target }, revert) => {
      let response;
      try {
        response = await mutateUserNotificationSettings({
          category,
          isEnabled: !isEnabled,
          target
        });
      } catch {
        revert?.();
        return;
      }
      if (response?.code === 200) {
        refetchUserNotificationSettings();
        await syncPushToken();
      } else {
        revert?.();
      }
    },
    [mutateUserNotificationSettings, refetchUserNotificationSettings, syncPushToken]
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
      {syncError && <VolunteerStorageError onRetry={syncPushToken} />}
      <SectionHeader title={texts.volunteer.notificationsTitle} big center />

      {mobileSettings?.map((setting, index: number) => (
        <WrapperHorizontal key={keyExtractor(setting, index)}>
          <SettingsToggle
            item={{
              bottomDivider: true,
              description:
                categories?.find((category) => category.id === setting.category)?.description ||
                setting.key,
              onActivate: (revert) => onUpdate(setting, revert),
              onDeactivate: (revert) => onUpdate(setting, revert),
              title:
                categories?.find((category) => category.id === setting.category)?.title ||
                setting.key,
              topDivider: index !== 0,
              value: setting.isEnabled
            }}
          />
        </WrapperHorizontal>
      ))}
    </>
  );
};

const styles = StyleSheet.create({});
