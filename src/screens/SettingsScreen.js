import { isARSupportedOnDevice } from '@viro-community/react-viro';
import PropTypes from 'prop-types';
import React, { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, SectionList, StyleSheet } from 'react-native';

import {
  AugmentedReality,
  LoadingContainer,
  RegularText,
  SafeAreaViewFlex,
  SettingsToggle,
  TextListItem,
  Wrapper
} from '../components';
import {
  ListSettings,
  LocationSettings,
  MowasRegionSettings,
  PermanentFilterSettings
} from '../components/settings';
import { colors, consts, normalize, texts } from '../config';
import {
  addToStore,
  createMatomoUserId,
  matomoSettings,
  readFromStore,
  removeMatomoUserId
} from '../helpers';
import { useMatomoTrackScreenView } from '../hooks';
import { ONBOARDING_STORE_KEY } from '../OnboardingManager';
import {
  handleSystemPermissions,
  PushNotificationStorageKeys,
  setInAppPermission,
  showSystemPermissionMissingDialog
} from '../pushNotifications';
import { SettingsContext } from '../SettingsProvider';
import { ScreenName } from '../types';

const { MATOMO_TRACKING } = consts;

const keyExtractor = (item, index) => `index${index}-item${item.title || item}`;

const renderItem = ({ item, navigation }) => {
  if (item === 'locationSettings') {
    return (
      <TextListItem
        item={{
          isHeadlineTitle: false,
          params: { setting: item, title: texts.settingsContents.locationService.setting },
          routeName: ScreenName.Settings,
          title: texts.settingsContents.locationService.setting,
          topDivider: true
        }}
        listsWithoutArrows
        navigation={navigation}
      />
    );
  }

  if (item === 'permanentFilterSettings') {
    return (
      <TextListItem
        item={{
          isHeadlineTitle: false,
          params: { setting: item, title: texts.settingsContents.permanentFilter.setting },
          routeName: ScreenName.Settings,
          title: texts.settingsContents.permanentFilter.setting
        }}
        listsWithoutArrows
        navigation={navigation}
      />
    );
  }

  if (item === 'mowasRegionSettings') {
    return (
      <TextListItem
        item={{
          isHeadlineTitle: false,
          params: { setting: item, title: texts.settingsContents.mowasRegion.setting },
          routeName: ScreenName.Settings,
          title: texts.settingsContents.mowasRegion.setting
        }}
        listsWithoutArrows
        navigation={navigation}
      />
    );
  }

  if (item === 'listSettings') {
    return (
      <TextListItem
        item={{
          isHeadlineTitle: false,
          params: { setting: item, title: texts.settingsContents.list.setting },
          routeName: ScreenName.Settings,
          title: texts.settingsContents.list.setting
        }}
        listsWithoutArrows
        navigation={navigation}
      />
    );
  }

  if (item === 'augmentedRealitySettings') {
    return (
      <TextListItem
        item={{
          isHeadlineTitle: false,
          params: { setting: item, title: texts.settingsContents.ar.setting },
          routeName: ScreenName.Settings,
          title: texts.settingsContents.ar.setting
        }}
        listsWithoutArrows
        navigation={navigation}
      />
    );
  }

  return <SettingsToggle item={item} />;
};

renderItem.propTypes = {
  item: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  section: PropTypes.object.isRequired,
  orientation: PropTypes.string.isRequired,
  dimensions: PropTypes.object.isRequired
};

const onActivatePushNotifications = (revert) => {
  handleSystemPermissions(false)
    .then((hasPermission) => {
      if (!hasPermission) {
        showSystemPermissionMissingDialog();
        revert();
      } else {
        setInAppPermission(true)
          .then((success) => !success && revert())
          .catch((error) => {
            console.warn('An error occurred while activating push notifications:', error);
            revert();
          });
      }
    })
    .catch((error) => {
      console.warn(
        'An error occurred while handling system permissions for activating push notifications:',
        error
      );
    });
};

const onDeactivatePushNotifications = (revert) => {
  setInAppPermission(false)
    .then((success) => !success && revert())
    .catch((error) => {
      console.warn('An error occurred while deactivating push notifications:', error);
      revert();
    });
};

export const SettingsScreen = ({ navigation, route }) => {
  const { globalSettings } = useContext(SettingsContext);
  const { mowas, settings = {} } = globalSettings;
  const [data, setData] = useState([]);
  const { setting = '' } = route?.params || {};

  useMatomoTrackScreenView(MATOMO_TRACKING.SCREEN_VIEW.SETTINGS);

  useEffect(() => {
    const updateData = async () => {
      const settingsList = [];

      // add push notification option if they are enabled
      if (settings.pushNotifications !== false) {
        const pushPermission = await readFromStore(PushNotificationStorageKeys.IN_APP_PERMISSION);

        settingsList.push({
          data: [
            {
              title: texts.settingsTitles.pushNotifications,
              topDivider: false,
              value: pushPermission,
              onActivate: onActivatePushNotifications,
              onDeactivate: onDeactivatePushNotifications
            }
          ]
        });
      }

      // settings should sometimes contain matomo analytics next, depending on server settings
      if (settings.matomo) {
        const { consent: matomoValue } = await matomoSettings();

        settingsList.push({
          data: [
            {
              title: texts.settingsTitles.analytics,
              topDivider: true,
              value: matomoValue,
              onActivate: (revert) =>
                Alert.alert(
                  texts.settingsTitles.analytics,
                  texts.settingsContents.analytics.onActivate,
                  [
                    {
                      text: texts.settingsContents.analytics.no,
                      onPress: revert,
                      style: 'cancel'
                    },
                    {
                      text: texts.settingsContents.analytics.yes,
                      onPress: createMatomoUserId
                    }
                  ],
                  { cancelable: false }
                ),
              onDeactivate: (revert) =>
                Alert.alert(
                  texts.settingsTitles.analytics,
                  texts.settingsContents.analytics.onDeactivate,
                  [
                    {
                      text: texts.settingsContents.analytics.no,
                      onPress: revert,
                      style: 'cancel'
                    },
                    {
                      text: texts.settingsContents.analytics.yes,
                      onPress: removeMatomoUserId
                    }
                  ],
                  { cancelable: false }
                )
            }
          ]
        });
      }

      if (settings.onboarding) {
        const onboarding = await readFromStore(ONBOARDING_STORE_KEY);

        settingsList.push({
          data: [
            {
              title: texts.settingsTitles.onboarding,
              topDivider: true,
              value: onboarding === 'incomplete',
              onActivate: () =>
                Alert.alert(
                  texts.settingsTitles.onboarding,
                  texts.settingsContents.onboarding.onActivate,
                  [
                    {
                      text: texts.settingsContents.onboarding.ok,
                      onPress: () => addToStore(ONBOARDING_STORE_KEY, 'incomplete')
                    }
                  ]
                ),
              onDeactivate: () =>
                Alert.alert(
                  texts.settingsTitles.onboarding,
                  texts.settingsContents.onboarding.onDeactivate,
                  [
                    {
                      text: texts.settingsContents.onboarding.ok,
                      onPress: () => addToStore(ONBOARDING_STORE_KEY, 'complete')
                    }
                  ]
                )
            }
          ]
        });
      }

      if (settings.locationService) {
        settingsList.push({
          data: ['locationSettings']
        });
      }

      settingsList.push({
        data: ['permanentFilterSettings']
      });

      if (mowas?.regionalKeys?.length) {
        settingsList.push({
          data: ['mowasRegionSettings']
        });
      }

      // settingsList.push({
      //   data: ['listSettings']
      // });

      if (settings.ar) {
        try {
          isARSupportedOnDevice(
            () => null,
            () => {
              settingsList.push({
                data: ['augmentedRealitySettings']
              });
            }
          );
        } catch (error) {
          // if Viro is not integrated, we need to catch the error for `isARSupportedOnDevice of null`
          console.warn(error);
        }
      }

      setData(settingsList);
    };

    setting == '' && updateData();
  }, [setting]);

  if (setting == '' && !data.length) {
    return (
      <LoadingContainer>
        <ActivityIndicator color={colors.refreshControl} />
      </LoadingContainer>
    );
  }

  // switch to have a condition on `setting` to decide which component to render
  let Component;

  switch (setting) {
    case 'locationSettings':
      Component = <LocationSettings />;
      break;
    case 'permanentFilterSettings':
      Component = <PermanentFilterSettings />;
      break;
    case 'mowasRegionSettings':
      Component = <MowasRegionSettings mowasRegionalKeys={mowas?.regionalKeys} />;
      break;
    case 'listSettings':
      Component = <ListSettings />;
      break;
    case 'augmentedRealitySettings':
      Component = <AugmentedReality id={settings.ar.tourId} onSettingsScreen />;
      break;
    default:
      Component = (
        <SectionList
          initialNumToRender={100}
          keyExtractor={keyExtractor}
          sections={data}
          renderItem={({ item }) => renderItem({ item, navigation })}
          ListHeaderComponent={
            !!texts.settingsScreen.intro && (
              <Wrapper>
                <RegularText>{texts.settingsScreen.intro}</RegularText>
              </Wrapper>
            )
          }
          style={styles.container}
        />
      );
      break;
  }

  return <SafeAreaViewFlex>{Component}</SafeAreaViewFlex>;
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: normalize(14)
  }
});

SettingsScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired
};
