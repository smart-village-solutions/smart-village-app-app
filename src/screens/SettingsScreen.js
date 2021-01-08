import PropTypes from 'prop-types';
import React, { useContext, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SectionList,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';

import { OrientationContext } from '../OrientationProvider';
import { SettingsContext } from '../SettingsProvider';
import { colors, consts, device, normalize, texts } from '../config';
import {
  Icon,
  LoadingContainer,
  RegularText,
  SafeAreaViewFlex,
  SettingsListItem,
  Title,
  TitleContainer,
  TitleShadow,
  ToggleListItem,
  Wrapper
} from '../components';
import { arrowLeft } from '../icons';
import { PushNotificationStorageKeys, setInAppPermission } from '../pushNotifications';
import { QUERY_TYPES } from '../queries';
import { createMatomoUserId, readFromStore, removeMatomoUserId, storageHelper } from '../helpers';
import { useMatomoTrackScreenView } from '../hooks';

const { MATOMO_TRACKING } = consts;

const keyExtractor = (item, index) => `index${index}-id${item.id}`;

const renderSectionHeader = ({ section: { title } }) =>
  !!title && (
    <View>
      <TitleContainer>
        <Title accessibilityLabel={`${title} (Überschrift)`}>{title}</Title>
      </TitleContainer>
      {device.platform === 'ios' && <TitleShadow />}
    </View>
  );

const renderItem = ({ item, index, section, orientation, dimensions }) =>
  item.type === 'toggle' ? (
    <ToggleListItem {...{ item, index, section }} />
  ) : (
    <SettingsListItem {...{ item, index, section, orientation, dimensions }} />
  );

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

const onActivateContrast = () => {
  storageHelper.setContrastSetting(true);
  // TODO: react to the change with some provider / theming stuff
};

const onDeactivateContrast = () => {
  storageHelper.setContrastSetting(false);
};

export const SettingsScreen = () => {
  const { orientation, dimensions } = useContext(OrientationContext);
  const { globalSettings, listTypesSettings, setListTypesSettings } = useContext(SettingsContext);
  const [sectionedData, setSectionedData] = useState([]);

  useMatomoTrackScreenView(MATOMO_TRACKING.SCREEN_VIEW.SETTINGS);

  useEffect(() => {
    const onListTypePress = (selectedListType, queryType) =>
      setListTypesSettings((previousListTypes) => {
        const updatedListTypesSettings = {
          ...previousListTypes,
          [queryType]: selectedListType
        };

        storageHelper.setListTypesSettings(updatedListTypesSettings);

        return updatedListTypesSettings;
      });

    const updateSectionedData = async () => {
      const { settings = { matomo: false, contrast: false } } = globalSettings;
      const { consent: matomoValue } = await storageHelper.matomoSettings();
      const pushPermission = await readFromStore(PushNotificationStorageKeys.IN_APP_PERMISSION);
      const contrastSetting = await storageHelper.contrastSetting();

      // settings should always contain push notifications
      const additionalSectionedData = [
        {
          data: [
            {
              title: texts.settingsTitles.pushNotifications,
              topDivider: true,
              type: 'toggle',
              value: pushPermission,
              onActivate: onActivatePushNotifications,
              onDeactivate: onDeactivatePushNotifications
            }
          ]
        }
      ];

      // settings should sometimes contain matomo analytics next, depending on server settings
      if (settings.matomo) {
        additionalSectionedData.push({
          data: [
            {
              title: texts.settingsTitles.analytics,
              topDivider: true,
              type: 'toggle',
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

      // settings should sometimes contain contrast switch next, depending on server settings
      if (settings.contrast) {
        additionalSectionedData.push({
          data: [
            {
              title: texts.settingsTitles.contrast,
              topDivider: true,
              type: 'toggle',
              value: contrastSetting,
              onActivate: onActivateContrast,
              onDeactivate: onDeactivateContrast
            }
          ]
        });
      }

      // settings should always contain list layouts last
      const { sections = {} } = globalSettings;
      const {
        categoriesNews = [
          {
            categoryTitle: texts.settingsTitles.listLayouts.newsItemsTitle
          }
        ]
      } = sections;

      additionalSectionedData.push({
        title: texts.settingsTitles.listLayouts.sectionTitle,
        data: [
          {
            title: categoriesNews.map((categoryNews) => categoryNews.categoryTitle).join(', '),
            type: 'listLayout',
            listSelection: listTypesSettings[QUERY_TYPES.NEWS_ITEMS],
            onPress: (listType) => onListTypePress(listType, QUERY_TYPES.NEWS_ITEMS)
          },
          {
            title: texts.settingsTitles.listLayouts.eventRecordsTitle,
            type: 'listLayout',
            listSelection: listTypesSettings[QUERY_TYPES.EVENT_RECORDS],
            onPress: (listType) => onListTypePress(listType, QUERY_TYPES.EVENT_RECORDS)
          },
          {
            title: texts.settingsTitles.listLayouts.pointsOfInterestAndToursTitle,
            type: 'listLayout',
            listSelection: listTypesSettings[QUERY_TYPES.POINTS_OF_INTEREST_AND_TOURS],
            onPress: (listType) =>
              onListTypePress(listType, QUERY_TYPES.POINTS_OF_INTEREST_AND_TOURS),
            bottomDivider: true
          }
        ]
      });

      setSectionedData(additionalSectionedData);
    };

    updateSectionedData();
  }, [listTypesSettings]);

  if (!sectionedData.length) {
    return (
      <LoadingContainer>
        <ActivityIndicator color={colors.accent} />
      </LoadingContainer>
    );
  }

  return (
    <SafeAreaViewFlex>
      <SectionList
        keyExtractor={keyExtractor}
        sections={sectionedData}
        renderItem={({ item, index, section }) =>
          renderItem({ item, index, section, orientation, dimensions })
        }
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
    </SafeAreaViewFlex>
  );
};

SettingsScreen.navigationOptions = ({ navigation }) => {
  return {
    headerLeft: (
      <View>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          accessibilityLabel="Zurück (Taste)"
          accessibilityHint="Navigieren zurück zur vorherigen Seite"
        >
          <Icon xml={arrowLeft(colors.lightestText)} style={styles.icon} />
        </TouchableOpacity>
      </View>
    )
  };
};

const styles = StyleSheet.create({
  icon: {
    paddingHorizontal: normalize(14)
  }
});
