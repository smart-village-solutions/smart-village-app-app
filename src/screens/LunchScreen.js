import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors, consts, normalize } from '../config';
import {
  BoldText,
  Icon,
  Image,
  ImagesCarousel,
  LunchSection,
  SafeAreaViewFlex,
  Wrapper,
  WrapperWithOrientation
} from '../components';
import { arrowLeft } from '../icons';
import { useMatomoTrackScreenView } from '../hooks';
import { momentFormat } from '../helpers';

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
  const [data, setData] = useState([]);

  useMatomoTrackScreenView(MATOMO_TRACKING.SCREEN_VIEW.LUNCH);

  const renderItem = () => <LunchSection navigation={navigation} />;

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
    <TouchableOpacity
      onPress={() => setData([1, 5, 9])}
      style={{ backgroundColor: 'red', height: 20 }}
    />
  );

  return (
    <SafeAreaViewFlex>
      <FlatList
        data={data}
        renderItem={renderItem}
        ListEmptyComponent={ListEmptyComponent}
        ListHeaderComponent={ListHeaderComponent}
        keyExtractor={(item) => item.toString()}
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
