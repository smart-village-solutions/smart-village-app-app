import PropTypes from 'prop-types';
import React, { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, SectionList } from 'react-native';

import {
  AugmentedReality,
  IndexFilterWrapperAndList,
  LoadingContainer,
  RegularText,
  SafeAreaViewFlex,
  SectionHeader,
  SettingsToggle,
  Wrapper
} from '../components';
import { ListSettings, LocationSettings, PermanentFilterSettings } from '../components/settings';
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
import { PushNotificationStorageKeys, setInAppPermission } from '../pushNotifications';
import { SettingsContext } from '../SettingsProvider';

const { MATOMO_TRACKING } = consts;

const keyExtractor = (item, index) => `index${index}-id${item.id}`;

const renderSectionHeader = ({ section: { title } }) => !!title && <SectionHeader title={title} />;

const renderItem = ({ item, index, section }) => <SettingsToggle {...{ item, index, section }} />;

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

const TOP_FILTER = {
  AR_DOWNLOAD_LIST: 'arDownloadList',
  GENERAL: 'general',
  LIST_TYPES: 'listTypes'
};

const INITIAL_FILTER = [
  { id: TOP_FILTER.GENERAL, title: texts.settingsTitles.tabs.general, selected: true },
  { id: TOP_FILTER.LIST_TYPES, title: texts.settingsTitles.tabs.listTypes, selected: false },
  { id: TOP_FILTER.AR_DOWNLOAD_LIST, title: texts.settingsTitles.tabs.arSettings, selected: false }
];

export const SettingsScreen = () => {
  const { globalSettings } = useContext(SettingsContext);
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

      if (settings.onboarding) {
        const onboarding = await readFromStore(ONBOARDING_STORE_KEY);

        additionalSectionedData.push({
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
        additionalSectionedData.push({
          data: ['locationSettings'],
          title: texts.settingsContents.locationService.sectionHeader,
          renderItem: () => <LocationSettings />
        });
      }

      additionalSectionedData.push({
        data: ['permanentFilters'],
        title: texts.settingsContents.permanentFilter.sectionHeader,
        renderItem: () => <PermanentFilterSettings />
      });
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
      {selectedFilterId === TOP_FILTER.GENERAL && (
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
      {selectedFilterId === TOP_FILTER.LIST_TYPES && <ListSettings />}
      {selectedFilterId === TOP_FILTER.AR_DOWNLOAD_LIST && <AugmentedReality onSettingsScreen />}
    </SafeAreaViewFlex>
  );
};
