import PropTypes from 'prop-types';
import React, { useCallback, useContext, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { normalize } from 'react-native-elements';

import { colors, consts, device } from '../../config';
import { useStaticContent } from '../../hooks';
import { NetworkContext } from '../../NetworkProvider';
import { LoadingContainer } from '../LoadingContainer';
import { SafeAreaViewFlex } from '../SafeAreaViewFlex';
import { Title, TitleContainer, TitleShadow } from '../Title';
import { WrapperWrap } from '../Wrapper';

import { ServiceTile } from './ServiceTile';

export const ServiceTiles = ({ navigation, staticJsonName, title }) => {
  const { isConnected } = useContext(NetworkContext);
  const [refreshing, setRefreshing] = useState(false);

  const { data, loading, refetch } = useStaticContent({
    refreshTimeKey: `publicJsonFile-${staticJsonName}`,
    name: staticJsonName,
    type: 'json'
  });

  const refresh = useCallback(async () => {
    setRefreshing(true);
    isConnected && (await refetch?.());
    setRefreshing(false);
  }, [refetch, isConnected]);

  if (loading) {
    return (
      <LoadingContainer>
        <ActivityIndicator color={colors.accent} />
      </LoadingContainer>
    );
  }

  return (
    <SafeAreaViewFlex>
      <>
        {!!title && (
          <TitleContainer>
            <Title accessibilityLabel={`(${title}) ${consts.a11yLabel.heading}`}>{title}</Title>
          </TitleContainer>
        )}
        {!!title && device.platform === 'ios' && <TitleShadow />}
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => refresh(refetch)}
              colors={[colors.accent]}
              tintColor={colors.accent}
            />
          }
        >
          <View style={styles.padding}>
            <WrapperWrap spaceBetween>
              {data?.map((item, index) => (
                <ServiceTile key={index + item.title} navigation={navigation} item={item} />
              ))}
            </WrapperWrap>
          </View>
        </ScrollView>
      </>
    </SafeAreaViewFlex>
  );
};

const styles = StyleSheet.create({
  padding: {
    padding: normalize(14)
  }
});

ServiceTiles.propTypes = {
  navigation: PropTypes.object.isRequired,
  staticJsonName: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired
};
