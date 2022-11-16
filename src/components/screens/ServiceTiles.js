import PropTypes from 'prop-types';
import React, { useCallback, useContext, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { colors, consts, device, normalize } from '../../config';
import { useStaticContent, useVolunteerRefresh } from '../../hooks';
import { NetworkContext } from '../../NetworkProvider';
import { HtmlView } from '../HtmlView';
import { Image } from '../Image';
import { LoadingSpinner } from '../LoadingSpinner';
import { SafeAreaViewFlex } from '../SafeAreaViewFlex';
import { Title, TitleContainer, TitleShadow } from '../Title';
import { Wrapper } from '../Wrapper';

import { Service } from './Service';

export const ServiceTiles = ({ html, image, query, staticJsonName, title }) => {
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

  useVolunteerRefresh(refetch, query);

  if (loading) {
    return <LoadingSpinner loading />;
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
          {!!image && <Image source={{ uri: image }} containerStyle={styles.imageContainerStyle} />}

          {!!html && (
            <Wrapper>
              <HtmlView html={html} />
            </Wrapper>
          )}

          <View style={styles.padding}>
            <Service data={data} staticJsonName={staticJsonName} />
          </View>
        </ScrollView>
      </>
    </SafeAreaViewFlex>
  );
};

const styles = StyleSheet.create({
  imageContainerStyle: {
    alignSelf: 'center'
  },
  padding: {
    padding: normalize(14)
  }
});

ServiceTiles.propTypes = {
  html: PropTypes.string,
  image: PropTypes.string,
  query: PropTypes.string,
  staticJsonName: PropTypes.string.isRequired,
  title: PropTypes.string
};
