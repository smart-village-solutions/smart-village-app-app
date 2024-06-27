import PropTypes from 'prop-types';
import React, { useCallback, useContext, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { NetworkContext } from '../../NetworkProvider';
import { colors, normalize } from '../../config';
import { useStaticContent, useVolunteerRefresh } from '../../hooks';
import { HtmlView } from '../HtmlView';
import { Image } from '../Image';
import { LoadingSpinner } from '../LoadingSpinner';
import { SafeAreaViewFlex } from '../SafeAreaViewFlex';
import { SectionHeader } from '../SectionHeader';
import { Wrapper } from '../Wrapper';

import { Service } from './Service';

export const ServiceTiles = ({
  hasDiagonalGradientBackground,
  html,
  image,
  isEditMode,
  query,
  staticJsonName,
  title
}) => {
  const { isConnected } = useContext(NetworkContext);
  const [refreshing, setRefreshing] = useState(false);

  const { data, loading, refetch, error } = useStaticContent({
    refreshTimeKey: `publicJsonFile-${staticJsonName}`,
    name: staticJsonName,
    type: 'json'
  });

  const {
    data: htmlContent,
    loading: htmlLoading,
    refetch: htmlRefetch
  } = useStaticContent({
    refreshTimeKey: `publicJsonFile-${staticJsonName}Content`,
    name: `${staticJsonName}Content`,
    type: 'json'
  });

  const refresh = useCallback(async () => {
    setRefreshing(true);
    isConnected && (await refetch?.());
    isConnected && (await htmlRefetch?.());
    setRefreshing(false);
  }, [isConnected, refetch]);

  useVolunteerRefresh(refetch, query);

  if (loading || htmlLoading) {
    return <LoadingSpinner loading />;
  }

  const contentForAbove = html || htmlContent?.forAbove;
  const contentForBelow = htmlContent?.forBelow;

  return (
    <SafeAreaViewFlex>
      {isEditMode ? (
        <Service
          data={data}
          isEditMode
          staticJsonName={staticJsonName}
          hasDiagonalGradientBackground={hasDiagonalGradientBackground}
        />
      ) : (
        <>
          <SectionHeader title={title} />
          <ScrollView
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={refresh}
                colors={[colors.refreshControl]}
                tintColor={colors.refreshControl}
              />
            }
          >
            {!!image && (
              <Image source={{ uri: image }} containerStyle={styles.imageContainerStyle} />
            )}

            {!!contentForAbove && (
              <Wrapper>
                <HtmlView html={contentForAbove} />
              </Wrapper>
            )}

            <View style={styles.padding}>
              {!error && <Service data={data} staticJsonName={staticJsonName} />}
            </View>

            {!!contentForBelow && (
              <Wrapper>
                <HtmlView html={contentForBelow} />
              </Wrapper>
            )}
          </ScrollView>
        </>
      )}
    </SafeAreaViewFlex>
  );
};

const styles = StyleSheet.create({
  imageContainerStyle: {
    alignSelf: 'center'
  },
  padding: {
    padding: normalize(16),
    paddingBottom: normalize(8)
  }
});

ServiceTiles.propTypes = {
  hasDiagonalGradientBackground: PropTypes.bool,
  html: PropTypes.string,
  image: PropTypes.string,
  isEditMode: PropTypes.bool,
  query: PropTypes.string,
  staticJsonName: PropTypes.string.isRequired,
  title: PropTypes.string
};
