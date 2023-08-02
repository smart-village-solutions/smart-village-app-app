import { useNavigation } from '@react-navigation/core';
import React, { useCallback, useContext } from 'react';
import { useQuery } from 'react-apollo';
import { StyleSheet, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

import { consts, normalize, texts } from '../../config';
import { graphqlFetchPolicy } from '../../helpers';
import { useHomeRefresh } from '../../hooks';
import { NetworkContext } from '../../NetworkProvider';
import { getQuery, QUERY_TYPES } from '../../queries';
import { WidgetProps } from '../../types';
import { Image } from '../Image';
import { BoldText, RegularText } from '../Text';
import { WrapperRow, WrapperVertical } from '../Wrapper';
import { testIDs } from '../../config/maestro';

const { POLL_INTERVALS } = consts;

export const WeatherWidget = ({ text }: WidgetProps) => {
  const navigation = useNavigation();
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp });
  const queryVariables =
    fetchPolicy === 'network-only'
      ? { fetchPolicy, pollInterval: POLL_INTERVALS.WEATHER }
      : { fetchPolicy };
  const { data, refetch } = useQuery(getQuery(QUERY_TYPES.WEATHER_MAP_CURRENT), queryVariables);

  const icon = data?.weatherMap?.current?.weather?.[0]?.icon ?? '02d';
  const description = data?.weatherMap?.current?.weather?.[0]?.description;
  const temperature = data?.weatherMap?.current?.temp;

  const onPress = useCallback(
    () => navigation?.navigate('Weather', { title: text ?? texts.screenTitles.weather }),
    [navigation, text]
  );

  useHomeRefresh(refetch);

  return (
    <TouchableOpacity onPress={onPress} style={styles.widget}>
      <WrapperVertical testID={testIDs.widgets.weather}>
        <WrapperRow center>
          <View style={styles.iconContainer}>
            <Image
              source={{
                uri: `https://openweathermap.org/img/wn/${icon}@2x.png`,
                captionText: description
              }}
              style={styles.icon}
              resizeMode="contain"
            />
          </View>
          <View>
            <BoldText primary big>
              {temperature?.toFixed(1) ?? '—'}°C
            </BoldText>
            <RegularText primary small>
              {text ?? texts.widgets.weather}
            </RegularText>
          </View>
        </WrapperRow>
      </WrapperVertical>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  icon: {
    aspectRatio: 1,
    width: normalize(44)
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  widget: {
    alignItems: 'center'
  }
});
