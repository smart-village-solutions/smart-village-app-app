import { isARSupportedOnDevice } from '@viro-community/react-viro';
import PropTypes from 'prop-types';
import React, { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, SectionList } from 'react-native';

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
import { colors, consts, texts } from '../config';
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

export const SETTINGS_SCREENS = {
  AR: 'augmentedRealitySettings',
  LIST: 'listSettings',
  LOCATION: 'locationSettings',
  MOWAS_REGION: 'mowasRegionSettings',
  PERMANENT_FILTER: 'permanentFilterSettings'
};

const renderItem = ({ item, navigation }) => {
  if (item === SETTINGS_SCREENS.LOCATION) {
    return (
      <TextListItem
        item={{
          params: { setting: item, title: texts.settingsContents.locationService.setting },
          routeName: ScreenName.Settings,
          title: texts.settingsContents.locationService.setting,
          topDivider: true
        }}
        navigation={navigation}
      />
    );
  }

  if (item === SETTINGS_SCREENS.PERMANENT_FILTER) {
    return (
      <TextListItem
        item={{
          params: { setting: item, title: texts.settingsContents.permanentFilter.setting },
          routeName: ScreenName.Settings,
          title: texts.settingsContents.permanentFilter.setting
        }}
        navigation={navigation}
      />
    );
  }

  if (item === SETTINGS_SCREENS.MOWAS_REGION) {
    return (
      <TextListItem
        item={{
          params: { setting: item, title: texts.settingsContents.mowasRegion.setting },
          routeName: ScreenName.Settings,
          title: texts.settingsContents.mowasRegion.setting
        }}
        navigation={navigation}
      />
    );
  }

  if (item === SETTINGS_SCREENS.LIST) {
    return (
      <TextListItem
        item={{
          params: { setting: item, title: texts.settingsContents.list.setting },
          routeName: ScreenName.Settings,
          title: texts.settingsContents.list.setting
        }}
        navigation={navigation}
      />
    );
  }

  if (item === SETTINGS_SCREENS.AR) {
    return (
      <TextListItem
        item={{
          params: { setting: item, title: texts.settingsContents.ar.setting },
          routeName: ScreenName.Settings,
          title: texts.settingsContents.ar.setting
        }}
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
          data: [SETTINGS_SCREENS.LOCATION]
        });
      }

      settingsList.push({
        data: [SETTINGS_SCREENS.PERMANENT_FILTER]
      });

      if (mowas?.regionalKeys?.length) {
        settingsList.push({
          data: [SETTINGS_SCREENS.MOWAS_REGION]
        });
      }

      settingsList.push({
        data: [SETTINGS_SCREENS.LIST]
      });

      if (settings.ar) {
        try {
          isARSupportedOnDevice(
            () => null,
            () => {
              settingsList.push({
                data: [SETTINGS_SCREENS.AR]
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
    case SETTINGS_SCREENS.LOCATION:
      Component = <LocationSettings />;
      break;
    case SETTINGS_SCREENS.PERMANENT_FILTER:
      Component = <PermanentFilterSettings />;
      break;
    case SETTINGS_SCREENS.MOWAS_REGION:
      Component = <MowasRegionSettings mowasRegionalKeys={mowas?.regionalKeys} />;
      break;
    case SETTINGS_SCREENS.LIST:
      Component = <ListSettings />;
      break;
    case SETTINGS_SCREENS.AR:
      Component = <AugmentedReality id={settings.ar.tourId} onSettingsScreen />;
      break;
    default:
      Component = (
        <SectionList
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
        />
      );
      break;
  }

  return <SafeAreaViewFlex>{Component}</SafeAreaViewFlex>;
};

SettingsScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired
};
