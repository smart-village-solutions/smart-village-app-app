import PropTypes from 'prop-types';
import React, { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, SectionList } from 'react-native';

import {
  IndexFilterWrapperAndList,
  LoadingContainer,
  RegularText,
  SafeAreaViewFlex,
  SectionHeader,
  SettingsToggle,
  Wrapper
} from '../components';
import { ListSettings, LocationSettings } from '../components/settings';
import { colors, consts, texts } from '../config';
import { createMatomoUserId, matomoSettings, readFromStore, removeMatomoUserId } from '../helpers';
import { useMatomoTrackScreenView } from '../hooks';
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

const FILTER = {
  general: 'general',
  listTypes: 'listTypes'
};

const INITIAL_FILTER = [
  { id: FILTER.general, title: texts.settingsTitles.tabs.general, selected: true },
  { id: FILTER.listTypes, title: texts.settingsTitles.tabs.listTypes, selected: false }
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

      if (settings.locationService) {
        additionalSectionedData.push({
          data: ['locationSettings'],
          title: texts.settingsContents.locationService.sectionHeader,
          renderItem: () => <LocationSettings />
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
      {selectedFilterId === FILTER.general && (
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
      {selectedFilterId === FILTER.listTypes && <ListSettings />}
    </SafeAreaViewFlex>
  );
};
