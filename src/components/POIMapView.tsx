import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { colors, device, normalize } from '../config';
import { QUERY_TYPES } from '../queries';
import { ScreenName } from '../types';

import { Image } from './Image';
import { RegularText } from './Text';
import { Wrapper } from './Wrapper';

type Props = {
  details: any;
  id: string;
  images?: { sourceUrl: { url: string } }[];
  query: string;
  title: string;
};

export const POIMapView = ({ item }: { item: Props }) => {
  const { title, images, details, id } = item;
  const navigation = useNavigation();

  return (
    <View style={{ width: device.width }}>
      <Wrapper>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate(ScreenName.Detail, {
              details: { ...details, title },
              query: QUERY_TYPES.POINT_OF_INTEREST,
              queryVariables: { id }
            })
          }
          style={styles.container}
        >
          {!!images && images.length > 0 && (
            <View>
              <Image
                source={{ uri: images[0]?.sourceUrl.url }}
                borderRadius={normalize(12)}
                containerStyle={{ width: normalize(96), height: normalize(96) }}
              />
            </View>
          )}
          <View style={styles.textContainer}>
            <RegularText numberOfLines={3}>{title}</RegularText>
          </View>
        </TouchableOpacity>
      </Wrapper>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.lighterPrimary,
    borderRadius: normalize(12),
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%'
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: normalize(16),
    height: normalize(96)
  }
});
