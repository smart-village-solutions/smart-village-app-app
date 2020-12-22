import PropTypes from 'prop-types';
import React, { useCallback, useContext } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ListItem } from 'react-native-elements';

import { BoldText, Icon, RegularText, SafeAreaViewFlex } from '../components';
import { colors, consts, normalize } from '../config';
import { ConstructionSiteContext } from '../ConstructionSiteProvider';
import { momentFormat } from '../helpers';
import { useMatomoTrackScreenView } from '../hooks';
import { arrowLeft, arrowRight } from '../icons';

const { MATOMO_TRACKING } = consts;

export const ConstructionSiteOverviewScreen = ({ navigation }) => {
  const { constructionSites } = useContext(ConstructionSiteContext);

  useMatomoTrackScreenView(MATOMO_TRACKING.SCREEN_VIEW.CONSTRUCTION_SITE_OVERVIEW);

  const renderItem = useCallback(
    ({ index, item }) => {
      const onPress = () => navigation.navigate('ConstructionSiteDetail', { index });

      const { category, endDate, startDate, title } = item;

      const extendedTitle = (category ? `${category} - ` : '') + title;
      const formattedStartDate = momentFormat(startDate);

      const formattedEndDate = endDate ? momentFormat(endDate) : undefined;
      const formattedDates =
        !formattedEndDate || formattedEndDate === formattedStartDate
          ? formattedStartDate
          : `${formattedStartDate} - ${formattedEndDate}`;

      return (
        <ListItem
          onPress={onPress}
          rightIcon={<Icon xml={arrowRight(colors.darkText)} />}
          subtitle={<RegularText>{formattedDates}</RegularText>}
          title={<BoldText>{extendedTitle}</BoldText>}
          topDivider
        />
      );
    },
    [navigation]
  );

  return (
    <SafeAreaViewFlex>
      <FlatList data={constructionSites} renderItem={renderItem} />
    </SafeAreaViewFlex>
  );
};

const styles = StyleSheet.create({
  icon: {
    paddingHorizontal: normalize(14)
  }
});

ConstructionSiteOverviewScreen.navigationOptions = ({ navigation }) => {
  return {
    headerLeft: (
      <View>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          accessibilityLabel="Zurück Taste"
          accessibilityHint="Navigieren zurück zur vorherigen Seite"
        >
          <Icon xml={arrowLeft(colors.lightestText)} style={styles.icon} />
        </TouchableOpacity>
      </View>
    )
  };
};

ConstructionSiteOverviewScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
