import PropTypes from 'prop-types';
import React, { useCallback, useContext, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';

import { colors, consts, normalize, texts } from '../config';
import {
  BoldText,
  Icon,
  Image,
  ImagesCarousel,
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

// TODO: remove dummy images
const images = [
  {
    picture: {
      captionText: 'Rinder, Foto: Reiter- & Erlebnisbauernhof Groß Briesen',
      copyright: null,
      uri: 'http://backoffice2.reiseland-brandenburg.de/rpcServer/file/get/id/284434'
    }
  },
  {
    picture: {
      captionText: 'Rinder, Foto: Reiter- & Erlebnisbauernhof Groß Briesen',
      copyright: null,
      uri: 'http://backoffice2.reiseland-brandenburg.de/rpcServer/file/get/id/128936'
    }
  },
  {
    picture: {
      captionText: 'Hofansicht, Foto: Reiter- & Erlebnisbauernhof Groß Briesen',
      copyright: null,
      uri: 'http://backoffice2.reiseland-brandenburg.de/rpcServer/file/get/id/128935'
    }
  }
];

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
      {!!images && images.length > 1 && <ImagesCarousel data={images} />}

      <WrapperWithOrientation>
        {!!images && images.length === 1 && (
          <Image source={images[0].picture} containerStyle={styles.imageContainer} />
        )}
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

const styles = StyleSheet.create({
  icon: {
    paddingHorizontal: normalize(14)
  },
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
