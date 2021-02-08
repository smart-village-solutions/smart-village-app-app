import PropTypes from 'prop-types';
import React, { useCallback, useContext, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity
} from 'react-native';

import { colors, consts, normalize, texts } from '../config';
import {
  BoldText,
  ConnectedImagesCarousel,
  HeaderLeft,
  Icon,
  LunchSection,
  RegularText,
  SafeAreaViewFlex,
  Wrapper,
  WrapperRow,
  WrapperWithOrientation
} from '../components';
import { arrowLeft, arrowRight } from '../icons';
import { useMatomoTrackScreenView } from '../hooks';
import { graphqlFetchPolicy } from '../helpers';
import moment from 'moment';
import { NetworkContext } from '../NetworkProvider';
import { useQuery } from 'react-apollo';
import { getQuery, QUERY_TYPES } from '../queries';

const { MATOMO_TRACKING } = consts;

export const LunchScreen = ({ navigation }) => {
  const [date, setDate] = useState(moment());

  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp });

  const currentDate = moment(date).format('YYYY-MM-DD');

  const variables = {
    dateRange: [currentDate, currentDate]
  };

  const { data, loading, refetch } = useQuery(getQuery(QUERY_TYPES.LUNCHES), {
    fetchPolicy,
    variables
  });

  useMatomoTrackScreenView(MATOMO_TRACKING.SCREEN_VIEW.LUNCH);

  const onPressNext = useCallback(() => {
    setDate((oldDate) => moment(oldDate).add(1, 'day'));
  }, [setDate]);

  const onPressPrevious = useCallback(() => {
    setDate((oldDate) => moment(oldDate).subtract(1, 'day'));
  }, [setDate]);

  const renderItem = useCallback(
    ({ item }) => <LunchSection lunchOfferData={item} navigation={navigation} />,
    [navigation]
  );

  const ListHeaderComponent = (
    <>
      <ConnectedImagesCarousel
        navigation={navigation}
        publicJsonFile="lunchCarousel"
        refreshTimeKey="publicJsonFile-lunchCarousel"
      />
      <WrapperWithOrientation>
        <Wrapper>
          <WrapperRow>
            <TouchableOpacity onPress={onPressPrevious} style={styles.left}>
              <Icon xml={arrowLeft(colors.primary)} />
            </TouchableOpacity>
            <BoldText big>{date.format('DD.MM.YYYY')}</BoldText>
            <TouchableOpacity onPress={onPressNext} style={styles.right}>
              <Icon xml={arrowRight(colors.primary)} />
            </TouchableOpacity>
          </WrapperRow>
        </Wrapper>
      </WrapperWithOrientation>
    </>
  );

  const ListEmptyComponent = (
    <Wrapper>
      <RegularText>{texts.lunch.noOffers}</RegularText>
    </Wrapper>
  );

  return (
    <SafeAreaViewFlex>
      <FlatList
        refreshControl={
          <RefreshControl
            onRefresh={() => {
              refetch?.();
            }}
            colors={[colors.accent]}
            tintColor={colors.accent}
          />
        }
        data={!loading && data?.[QUERY_TYPES.LUNCHES]}
        renderItem={renderItem}
        ListEmptyComponent={
          loading ? <ActivityIndicator color={colors.accent} /> : ListEmptyComponent
        }
        ListHeaderComponent={ListHeaderComponent}
        keyExtractor={(item) => item.id}
      />
    </SafeAreaViewFlex>
  );
};

LunchScreen.navigationOptions = ({ navigation }) => {
  return {
    headerLeft: <HeaderLeft navigation={navigation} />
  };
};

const styles = StyleSheet.create({
  left: {
    flex: 1,
    marginRight: normalize(12)
  },
  right: {
    flex: 1,
    alignItems: 'flex-end',
    marginLeft: normalize(12)
  }
});

LunchScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
