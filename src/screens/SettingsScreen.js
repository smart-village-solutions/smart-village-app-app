import React, { useContext, useEffect, useState } from 'react';
import {
  Alert,
  RefreshControl,
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
import { QUERY_TYPES } from '../queries';
import { createMatomoUserId, removeMatomoUserId, storageHelper } from '../helpers';
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

export const SettingsScreen = () => {
  const { orientation, dimensions } = useContext(OrientationContext);
  const { globalSettings, listTypesSettings, setListTypesSettings } = useContext(SettingsContext);
  const [refreshing, setRefreshing] = useState(false);
  // settings should always contain push notifications
  const [sectionedData, setSectionedData] = useState([
    {
      data: [
        {
          title: texts.settingsTitles.pushNotifications,
          topDivider: true,
          type: 'toggle',
          value: false
        }
      ]
    }
  ]);

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
      const { settings = { matomo: false } } = globalSettings;
      const { consent: matomoValue } = await storageHelper.matomoSettings();

      setSectionedData((initialSectionedData) => {
        const additionalSectionedData = [];

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

        // settings should always contain list layouts last
        additionalSectionedData.push({
          title: texts.settingsTitles.listLayouts.sectionTitle,
          data: [
            {
              title: texts.settingsTitles.listLayouts.newsItemsTitle,
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

        return [...initialSectionedData, ...additionalSectionedData];
      });
    };

    updateSectionedData();
  }, []);

  const refresh = () => {
    setRefreshing(true);
    // TODO: do we need pull to refresh on the settings screen?
    // we simulate state change of `refreshing` with setting it to `true` first and after
    // a timeout to `false` again, which will result in a re-rendering of the screen.
    setTimeout(() => {
      setRefreshing(false);
    }, 500);
  };

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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => refresh()}
            colors={[colors.accent]}
            tintColor={colors.accent}
          />
        }
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
