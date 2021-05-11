import PropTypes from 'prop-types';
import React, { useCallback, useContext } from 'react';
import { FlatList } from 'react-native';

import {
  RegularText,
  SafeAreaViewFlex,
  TextListItem,
  Wrapper,
  WrapperWithOrientation
} from '../components';
import { consts, texts } from '../config';
import { ConstructionSiteContext } from '../ConstructionSiteProvider';
import { momentFormat } from '../helpers';
import { useMatomoTrackScreenView } from '../hooks';

const { MATOMO_TRACKING } = consts;

const keyExtractor = (item, index) => index + item.title + item.startDate;

export const ConstructionSiteOverviewScreen = ({ navigation }) => {
  const { constructionSites } = useContext(ConstructionSiteContext);

  useMatomoTrackScreenView(MATOMO_TRACKING.SCREEN_VIEW.CONSTRUCTION_SITES);

  const renderItem = useCallback(
    ({ index, item }) => {
      const { category, endDate, startDate, title } = item;

      const formattedStartDate = momentFormat(startDate);

      const formattedEndDate = endDate ? momentFormat(endDate) : undefined;
      const formattedDates =
        !formattedEndDate || formattedEndDate === formattedStartDate
          ? formattedStartDate
          : `${formattedStartDate} - ${formattedEndDate}`;

      const propItem = {
        title,
        subtitle: formattedDates + (category ? ` | ${category}` : ''),
        params: { index },
        routeName: 'ConstructionSiteDetail'
      };

      return <TextListItem item={propItem} navigation={navigation} />;
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

ConstructionSiteOverviewScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
