import PropTypes from 'prop-types';
import React, { useContext, useState } from 'react';
import { RefreshControl, SectionList, StyleSheet, TouchableOpacity, View } from 'react-native';

import { NetworkContext } from '../NetworkProvider';
import { OrientationContext } from '../OrientationProvider';
import { GlobalSettingsContext } from '../GlobalSettingsProvider';
import { colors, device, normalize, texts } from '../config';
import {
  CardListItem,
  Icon,
  RegularText,
  SafeAreaViewFlex,
  TextListItem,
  Title,
  TitleContainer,
  TitleShadow,
  Wrapper
} from '../components';
import { SettingsListItem } from '../components/SettingsListItem';
import { arrowLeft } from '../icons';

export const SettingsScreen = ({ navigation }) => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const { orientation, dimensions } = useContext(OrientationContext);
  const globalSettings = useContext(GlobalSettingsContext);
  const [refreshing, setRefreshing] = useState(false);

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

  const refresh = () => {
    setRefreshing(true);
    // TODO: do we need pull to refresh on the settings screen?
    // we simulate state change of `refreshing` with setting it to `true` first and after
    // a timeout to `false` again, which will result in a re-rendering of the screen.
    setTimeout(() => {
      setRefreshing(false);
    }, 500);
  };

  // TODO: get data from global settings
  const { sections = {} } = globalSettings;

  const sectionedData = [
    {
      data: [
        {
          title: texts.settingsTitles.pushNotifications,
          topDivider: true,
          type: 'toggle',
          value: false
        }
      ]
    },
    {
      data: [
        {
          title: texts.settingsTitles.analytics,
          topDivider: true,
          type: 'toggle',
          value: true
        }
      ]
    },
    {
      title: texts.settingsTitles.listLayouts.sectionTitle,
      data: [
        {
          title: texts.settingsTitles.listLayouts.newsItemsTitle,
          type: 'listLayout',
          listSelection: 'Textliste',
          Component: TextListItem
        },
        {
          title: texts.settingsTitles.listLayouts.eventRecordsTitle,
          type: 'listLayout',
          listSelection: 'Textliste',
          Component: TextListItem
        },
        {
          title: texts.settingsTitles.listLayouts.toursTitle,
          type: 'listLayout',
          listSelection: 'Liste mit großen Bildern',
          Component: CardListItem
        },
        {
          title: texts.settingsTitles.listLayouts.pointsOfInterestTitle,
          type: 'listLayout',
          listSelection: 'Liste mit großen Bildern',
          Component: CardListItem,
          bottomDivider: true
        }
      ]
    }
  ];

  return (
    <SafeAreaViewFlex>
      <SectionList
        keyExtractor={keyExtractor}
        sections={sectionedData}
        renderItem={({ item, index, section }) => (
          <SettingsListItem {...{ navigation, item, index, section, orientation, dimensions }} />
        )}
        renderSectionHeader={renderSectionHeader}
        ListHeaderComponent={
          <Wrapper>
            <RegularText>{texts.settingsScreen.intro}</RegularText>
          </Wrapper>
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

SettingsScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
