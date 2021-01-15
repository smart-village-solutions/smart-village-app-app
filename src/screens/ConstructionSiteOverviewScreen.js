import PropTypes from 'prop-types';
import React, { useCallback, useContext } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ListItem } from 'react-native-elements';

import {
  BoldText,
  Icon,
  RegularText,
  SafeAreaViewFlex,
  Touchable,
  Wrapper,
  WrapperWithOrientation
} from '../components';
import { colors, consts, normalize, texts } from '../config';
import { ConstructionSiteContext } from '../ConstructionSiteProvider';
import { momentFormat } from '../helpers';
import { useMatomoTrackScreenView } from '../hooks';
import { arrowLeft, arrowRight } from '../icons';

const { MATOMO_TRACKING } = consts;

const keyExtractor = (item, index) => index + item.title + item.startDate;

export const ConstructionSiteOverviewScreen = ({ navigation }) => {
  const { constructionSites } = useContext(ConstructionSiteContext);

  useMatomoTrackScreenView(MATOMO_TRACKING.SCREEN_VIEW.CONSTRUCTION_SITES);

  const renderItem = useCallback(
    ({ index, item }) => {
      const onPress = () => navigation.navigate('ConstructionSiteDetail', { index });

      const { category, endDate, startDate, title } = item;

      const formattedStartDate = momentFormat(startDate);

      const formattedEndDate = endDate ? momentFormat(endDate) : undefined;
      const formattedDates =
        !formattedEndDate || formattedEndDate === formattedStartDate
          ? formattedStartDate
          : `${formattedStartDate} - ${formattedEndDate}`;

      return (
        <ListItem
          title={<RegularText>{formattedDates + (category ? ` | ${category}` : '')}</RegularText>}
          subtitle={<BoldText>{title}</BoldText>}
          bottomDivider
          rightIcon={<Icon xml={arrowRight(colors.primary)} />}
          onPress={onPress}
          delayPressIn={0}
          Component={Touchable}
          accessibilityLabel={`${title} (Taste)`}
        />
      );
    },
    [navigation]
  );

  if (!constructionSites.length) {
    return (
      <SafeAreaViewFlex>
        <WrapperWithOrientation>
          <Wrapper>
            <RegularText>{texts.constructionSites.noInformationGiven}</RegularText>
          </Wrapper>
        </WrapperWithOrientation>
      </SafeAreaViewFlex>
    );
  }

  return (
    <SafeAreaViewFlex>
      <FlatList data={constructionSites} keyExtractor={keyExtractor} renderItem={renderItem} />
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
