import React, { useContext } from 'react';
import { useQuery } from 'react-apollo';
import { StyleSheet, View } from 'react-native';
import { NavigationScreenProp } from 'react-navigation';

import { consts, normalize } from '../../config';
import { graphqlFetchPolicy } from '../../helpers';
import { useHomeRefresh } from '../../hooks/HomeRefresh';
import { NetworkContext } from '../../NetworkProvider';
import { getQuery, QUERY_TYPES } from '../../queries';
import { Image } from '../Image';
import { BoldText } from '../Text';
import { Touchable } from '../Touchable';
import { Wrapper, WrapperRow } from '../Wrapper';

const { POLL_INTERVALS } = consts;

export const WeatherWidget = ({ navigation }: { navigation: NavigationScreenProp<never> }) => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp });
  const queryVariables =
    fetchPolicy === 'network-only'
      ? { fetchPolicy, pollInterval: POLL_INTERVALS.WEATHER }
      : { fetchPolicy };
  const { data, refetch } = useQuery(getQuery(QUERY_TYPES.WEATHER_MAP_CURRENT), queryVariables);

  const icon = data?.weatherMap?.current?.weather?.[0]?.icon ?? '02d';
  const temperature = data?.weatherMap?.current?.temp;

  useHomeRefresh(refetch);

  return (
    <Touchable
      onPress={() => navigation?.navigate('Weather', { weatherData: { icon, temperature } })}
      style={styles.widget}
    >
      <Wrapper>
        <WrapperRow center>
          <View style={styles.iconContainer}>
            <Image
              source={{ uri: `https://openweathermap.org/img/wn/${icon}@2x.png` }}
              style={styles.icon}
              resizeMode="contain"
            />
          </View>
          <View>
            <BoldText primary big>
              {temperature?.toFixed(1) ?? '—'}°C
            </BoldText>
            <BoldText primary small>
              Wetter
            </BoldText>
          </View>
        </WrapperRow>
      </Wrapper>
    </Touchable>
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
