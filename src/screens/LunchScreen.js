import PropTypes from 'prop-types';
import React, { useContext, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

import { colors, consts, normalize, texts } from '../config';
import {
  BoldText,
  Icon,
  Image,
  ImagesCarousel,
  LoadingContainer,
  LunchSection,
  RegularText,
  SafeAreaViewFlex,
  Wrapper,
  WrapperWithOrientation
} from '../components';
import { arrowLeft } from '../icons';
import { useMatomoTrackScreenView } from '../hooks';
import { graphqlFetchPolicy, momentFormat } from '../helpers';
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
  // TODO:  introduce day navigation
  const [date, setDate] = useState(moment());

  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp });

  const currentDate = moment(date).format('YYYY-MM-DD');

  const variables = {
    dateRange: [currentDate, currentDate]
  };

  const { data, loading } = useQuery(getQuery(QUERY_TYPES.LUNCHES), {
    fetchPolicy,
    variables
  });

  useMatomoTrackScreenView(MATOMO_TRACKING.SCREEN_VIEW.LUNCH);

  const renderItem = ({ item }) => <LunchSection lunchOfferData={item} navigation={navigation} />;

  const ListHeaderComponent = (
    <>
      {!!images && images.length > 1 && <ImagesCarousel data={images} />}

      <WrapperWithOrientation>
        {!!images && images.length === 1 && (
          <Image source={images[0].picture} containerStyle={styles.imageContainer} />
        )}
        <Wrapper>
          <BoldText big>{momentFormat(new Date().valueOf(), undefined, 'x')}</BoldText>
        </Wrapper>
      </WrapperWithOrientation>
    </>
  );

  const ListEmptyComponent = (
    <Wrapper>
      <RegularText>{texts.lunch.noOffers}</RegularText>
    </Wrapper>
  );

  if (loading) {
    return (
      <LoadingContainer>
        <ActivityIndicator color={colors.accent} />
      </LoadingContainer>
    );
  }

  if (!data?.[QUERY_TYPES.LUNCHES]) return null;

  return (
    <SafeAreaViewFlex>
      <FlatList
        data={data[QUERY_TYPES.LUNCHES]}
        renderItem={renderItem}
        ListEmptyComponent={ListEmptyComponent}
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
  }
});

LunchScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
