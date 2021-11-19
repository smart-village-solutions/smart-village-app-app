import PropTypes from 'prop-types';
import React, { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, SectionList, View } from 'react-native';
import * as Location from 'expo-location';

import { SettingsContext } from '../SettingsProvider';
import { colors, consts, device, texts } from '../config';
import {
  ListSettings,
  LoadingContainer,
  RegularText,
  SafeAreaViewFlex,
  Title,
  TitleContainer,
  TitleShadow,
  ToggleListItem,
  Wrapper
} from '../components';
import { PushNotificationStorageKeys, setInAppPermission } from '../pushNotifications';
import { createMatomoUserId, readFromStore, removeMatomoUserId, storageHelper } from '../helpers';
import { useLocationSettings, useMatomoTrackScreenView } from '../hooks';
import { IndexFilterWrapperAndList } from '../components/BB-BUS/IndexFilterWrapperAndList';

const { MATOMO_TRACKING } = consts;

const keyExtractor = (item, index) => `index${index}-id${item.id}`;

const renderSectionHeader = ({ section: { title } }) =>
  !!title && (
    <View>
      <TitleContainer>
        <Title accessibilityLabel={`(${title}) ${consts.a11yLabel.heading}`}>{title}</Title>
      </TitleContainer>
      {device.platform === 'ios' && <TitleShadow />}
    </View>
  );

const renderItem = ({ item, index, section }) => <ToggleListItem {...{ item, index, section }} />;

renderItem.propTypes = {
  item: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  section: PropTypes.object.isRequired,
  orientation: PropTypes.string.isRequired,
  dimensions: PropTypes.object.isRequired
};

const onActivatePushNotifications = (revert) => {
  setInAppPermission(true).then((success) => !success && revert());
};

const onDeactivatePushNotifications = (revert) => {
  setInAppPermission(false).then((success) => !success && revert());
};

const Filter = {
  general: 'general',
  listTypes: 'listTypes'
};

const INITIAL_FILTER = [
  { id: Filter.general, title: texts.settingsTitles.tabs.general, selected: true },
  { id: Filter.listTypes, title: texts.settingsTitles.tabs.listTypes, selected: false }
];

export const SettingsScreen = () => {
  const { globalSettings } = useContext(SettingsContext);
  const { locationSettings, setAndSyncLocationSettings } = useLocationSettings();
  const [sectionedData, setSectionedData] = useState([]);
  const [filter, setFilter] = useState(INITIAL_FILTER);
  const selectedFilterId = filter.find((entry) => entry.selected)?.id;

  useMatomoTrackScreenView(MATOMO_TRACKING.SCREEN_VIEW.SETTINGS);

  useEffect(() => {
    const updateSectionedData = async () => {
      const { settings = { matomo: false } } = globalSettings;

      const additionalSectionedData = [];

      // add push notification option if they are enabled
      if (settings.pushNotifications !== false) {
        const pushPermission = await readFromStore(PushNotificationStorageKeys.IN_APP_PERMISSION);

        additionalSectionedData.push({
          data: [
            {
              title: texts.settingsTitles.pushNotifications,
              topDivider: true,
              value: pushPermission,
              onActivate: onActivatePushNotifications,
              onDeactivate: onDeactivatePushNotifications
            }
          ]
        });
      }

      // settings should sometimes contain matomo analytics next, depending on server settings
      if (settings.matomo) {
        const { consent: matomoValue = false } = await storageHelper.matomoSettings();

        additionalSectionedData.push({
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

      // settings should sometimes contain location settings next, depending on server settings
      if (settings.locationService) {
        const systemPermission = await Location.getForegroundPermissionsAsync();

        const { locationService = systemPermission.status !== Location.PermissionStatus.DENIED } =
          locationSettings || {};

        additionalSectionedData.push({
          data: [
            {
              title: texts.settingsTitles.locationService,
              topDivider: true,
              value: locationService,
              onActivate: (revert) => {
                Location.getForegroundPermissionsAsync().then((response) => {
                  // if the system permission is granted, we can simply enable the sorting
                  if (response.status === Location.PermissionStatus.GRANTED) {
                    const newSettings = { locationService: true };
                    setAndSyncLocationSettings(newSettings);
                    return;
                  }

                  // if we can ask for the system permission, do so and update the settings or revert depending on the outcome
                  if (
                    response.status === Location.PermissionStatus.UNDETERMINED ||
                    response.canAskAgain
                  ) {
                    Location.requestForegroundPermissionsAsync()
                      .then((response) => {
                        if (response.status !== Location.PermissionStatus.GRANTED) {
                          revert();
                        } else {
                          const newSettings = { locationService: true };
                          setAndSyncLocationSettings(newSettings);
                          return;
                        }
                      })
                      .catch(() => revert());
                    return;
                  }

                  // if we neither have the permission, nor can we ask for it, then show an alert that the permission is missing
                  revert();
                  Alert.alert(
                    texts.settingsTitles.locationService,
                    texts.settingsContents.locationService.onSystemPermissionMissing
                  );
                });
              },
              onDeactivate: () => setAndSyncLocationSettings({ locationService: false })
            }
          ]
        });
      }

      setSectionedData(additionalSectionedData);
    };

    updateSectionedData();
  }, []);

  if (!sectionedData.length) {
    return (
      <LoadingContainer>
        <ActivityIndicator color={colors.accent} />
      </LoadingContainer>
    );
  }

  return (
    <SafeAreaViewFlex>
      <IndexFilterWrapperAndList filter={filter} setFilter={setFilter} />
      {selectedFilterId === Filter.general && (
        <SectionList
          keyExtractor={keyExtractor}
          sections={sectionedData}
          renderItem={({ item, index, section }) => renderItem({ item, index, section })}
          renderSectionHeader={renderSectionHeader}
          ListHeaderComponent={
            !!texts.settingsScreen.intro && (
              <Wrapper>
                <RegularText>{texts.settingsScreen.intro}</RegularText>
              </Wrapper>
            )
          }
          stickySectionHeadersEnabled
        />
      )}
      {selectedFilterId === Filter.listTypes && <ListSettings />}
    </SafeAreaViewFlex>
  );
};
