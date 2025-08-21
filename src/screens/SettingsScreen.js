import { isARSupportedOnDevice } from '@reactvision/react-viro';
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
  PermanentFilterSettings,
  PersonalizedPushSettings
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
import {
  HAS_TERMS_AND_CONDITIONS_STORE_KEY,
  ONBOARDING_STORE_KEY,
  TERMS_AND_CONDITIONS_STORE_KEY
} from '../OnboardingManager';
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
  PERMANENT_FILTER: 'permanentFilterSettings',
  PERSONALIZED_PUSH: 'personalizedPushSettings'
};

/* eslint-disable complexity */
const renderItem = ({ item, navigation, listsWithoutArrows, settingsScreenListItemTitles }) => {
  let component;
  const title = settingsScreenListItemTitles[item];

  if (item === SETTINGS_SCREENS.LOCATION) {
    component = (
      <TextListItem
        item={{
          isHeadlineTitle: false,
          params: { setting: item, title: title || texts.settingsContents.locationService.setting },
          routeName: ScreenName.Settings,
          title: title || texts.settingsContents.locationService.setting,
          topDivider: true
        }}
        listsWithoutArrows={listsWithoutArrows}
        navigation={navigation}
      />
    );
  } else if (item === SETTINGS_SCREENS.PERMANENT_FILTER) {
    component = (
      <TextListItem
        item={{
          isHeadlineTitle: false,
          params: { setting: item, title: title || texts.settingsContents.permanentFilter.setting },
          routeName: ScreenName.Settings,
          title: title || texts.settingsContents.permanentFilter.setting
        }}
        listsWithoutArrows={listsWithoutArrows}
        navigation={navigation}
      />
    );
  } else if (item === SETTINGS_SCREENS.MOWAS_REGION) {
    component = (
      <TextListItem
        item={{
          isHeadlineTitle: false,
          params: { setting: item, title: title || texts.settingsContents.mowasRegion.setting },
          routeName: ScreenName.Settings,
          title: title || texts.settingsContents.mowasRegion.setting
        }}
        listsWithoutArrows={listsWithoutArrows}
        navigation={navigation}
      />
    );
  } else if (item === SETTINGS_SCREENS.LIST) {
    component = (
      <TextListItem
        item={{
          isHeadlineTitle: false,
          params: { setting: item, title: title || texts.settingsContents.list.setting },
          routeName: ScreenName.Settings,
          title: title || texts.settingsContents.list.setting
        }}
        listsWithoutArrows={listsWithoutArrows}
        navigation={navigation}
      />
    );
  } else if (item === SETTINGS_SCREENS.AR) {
    component = (
      <TextListItem
        item={{
          isHeadlineTitle: false,
          params: { setting: item, title: title || texts.settingsContents.ar.setting },
          routeName: ScreenName.Settings,
          title: title || texts.settingsContents.ar.setting
        }}
        listsWithoutArrows={listsWithoutArrows}
        navigation={navigation}
      />
    );
  } else if (item === SETTINGS_SCREENS.PERSONALIZED_PUSH) {
    component = (
      <TextListItem
        item={{
          bottomDivider: false,
          isHeadlineTitle: false,
          params: {
            setting: item,
            title: title || texts.settingsContents.personalizedPush.setting
          },
          routeName: ScreenName.Settings,
          title: title || texts.settingsContents.personalizedPush.setting
        }}
        listsWithoutArrows={listsWithoutArrows}
        navigation={navigation}
      />
    );
  } else {
    component = <SettingsToggle needsConnection={false} item={item} />;
  }

  return component;
};
/* eslint-enable complexity */

renderItem.propTypes = {
  item: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  section: PropTypes.object.isRequired,
  orientation: PropTypes.string.isRequired,
  dimensions: PropTypes.object.isRequired
};

export const onActivatePushNotifications = (revert) => {
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

export const onDeactivatePushNotifications = (revert) => {
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
  const {
    listsWithoutArrows = false,
    settingsScreenListItemTitles = {},
    personalizedPush = {}
  } = settings;
  const [data, setData] = useState([]);
  const { setting = '' } = route?.params || {};

  useMatomoTrackScreenView(MATOMO_TRACKING.SCREEN_VIEW.SETTINGS);

  useEffect(() => {
    /* eslint-disable complexity */
    const updateData = async () => {
      const settingsList = [];

      // add push notification option if they are enabled
      if (settings.pushNotifications !== false) {
        const pushPermission = await readFromStore(PushNotificationStorageKeys.IN_APP_PERMISSION);

        if (personalizedPush.categories) {
          settingsList.push({
            data: [SETTINGS_SCREENS.PERSONALIZED_PUSH]
          });
        } else {
          settingsList.push({
            data: [
              {
                title:
                  settingsScreenListItemTitles.pushNotifications ||
                  texts.settingsTitles.pushNotifications,
                topDivider: false,
                value: pushPermission,
                onActivate: onActivatePushNotifications,
                onDeactivate: onDeactivatePushNotifications
              }
            ]
          });
        }
      }

      // settings should sometimes contain matomo analytics next, depending on server settings
      if (settings.matomo) {
        const { consent: matomoValue } = await matomoSettings();

        settingsList.push({
          data: [
            {
              title: settingsScreenListItemTitles.matomo || texts.settingsTitles.analytics,
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
              title: settingsScreenListItemTitles.onboarding || texts.settingsTitles.onboarding,
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

      const termsAndConditionsAccepted = await readFromStore(TERMS_AND_CONDITIONS_STORE_KEY);
      const hasTermsAndConditionsSection = await readFromStore(HAS_TERMS_AND_CONDITIONS_STORE_KEY);

      if (
        !!hasTermsAndConditionsSection &&
        termsAndConditionsAccepted != null &&
        termsAndConditionsAccepted != 'unknown'
      ) {
        settingsList.push({
          data: [
            {
              title:
                settingsScreenListItemTitles.termsAndConditions ||
                texts.settingsTitles.termsAndConditions,
              topDivider: true,
              value: termsAndConditionsAccepted === 'accepted',
              onActivate: () => null,
              onDeactivate: (revert) =>
                Alert.alert(
                  texts.profile.termsAndConditionsAlertTitle,
                  texts.settingsContents.termsAndConditions.onDeactivate,
                  [
                    {
                      text: texts.settingsContents.termsAndConditions.abort,
                      onPress: revert,
                      style: 'cancel'
                    },
                    {
                      text: texts.settingsContents.termsAndConditions.ok,
                      onPress: () => addToStore(TERMS_AND_CONDITIONS_STORE_KEY, 'declined'),
                      style: 'destructive'
                    }
                  ],
                  { cancelable: false }
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

      // settingsList.push({
      //   data: [SETTINGS_SCREENS.LIST]
      // });

      if (settings.ar?.tourId) {
        try {
          const isARSupported = (await isARSupportedOnDevice())?.isARSupported;

          if (isARSupported) {
            settingsList.push({
              data: [SETTINGS_SCREENS.AR]
            });
          }
        } catch (error) {
          // if Viro is not integrated, we need to catch the error for `isARSupportedOnDevice of null`
          console.error(error);
        }
      }

      setData(settingsList);
    };
    /* eslint-enable complexity */

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
      Component = <AugmentedReality id={settings.ar?.tourId} onSettingsScreen />;
      break;
    case SETTINGS_SCREENS.PERSONALIZED_PUSH:
      Component = <PersonalizedPushSettings />;
      break;
    default:
      Component = (
        <SectionList
          initialNumToRender={100}
          keyExtractor={keyExtractor}
          sections={data}
          renderItem={({ item }) =>
            renderItem({ item, navigation, listsWithoutArrows, settingsScreenListItemTitles })
          }
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
    paddingHorizontal: normalize(16)
  }
});

SettingsScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired
};
