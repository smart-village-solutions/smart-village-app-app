import PropTypes from 'prop-types';
import React, { useContext, useState } from 'react';
import { RefreshControl, SectionList, StyleSheet, TouchableOpacity, View } from 'react-native';

import { NetworkContext } from '../NetworkProvider';
import { OrientationContext } from '../OrientationProvider';
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
  ToggleListItem,
  Wrapper
} from '../components';
import { SettingsListItem } from '../components/SettingsListItem';
import { arrowLeft } from '../icons';
import { setInAppPermission } from '../pushNotifications';

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

const onActivatePushNotifications = (revert) => {
  setInAppPermission(true).then((success) => !success && revert());
};

const onDeactivatePushNotifications = (revert) => {
  setInAppPermission(false).then((success) => !success && revert());
};

export const SettingsScreen = ({ navigation }) => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const { orientation, dimensions } = useContext(OrientationContext);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = () => {
    setRefreshing(true);
    // TODO: do we need pull to refresh on the settings screen?
    // we simulate state change of `refreshing` with setting it to `true` first and after
    // a timeout to `false` again, which will result in a re-rendering of the screen.
    setTimeout(() => {
      setRefreshing(false);
    }, 500);
  };

  const sectionedData = [
    {
      data: [
        {
          title: texts.settingsTitles.pushNotifications,
          topDivider: true,
          type: 'toggle',
          value: false, // FIXME: add proper value
          onActivate: onActivatePushNotifications,
          onDeactivate: onDeactivatePushNotifications
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
        renderItem={({ item, index, section }) =>
          renderItem({ item, index, section, orientation, dimensions })
        }
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
