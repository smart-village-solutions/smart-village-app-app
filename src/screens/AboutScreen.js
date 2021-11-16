import PropTypes from 'prop-types';
import React, { useContext, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView } from 'react-native';
import { Query } from 'react-apollo';

import { NetworkContext } from '../NetworkProvider';
import { SettingsContext } from '../SettingsProvider';
import { colors, consts, device, texts } from '../config';
import {
  LoadingContainer,
  SafeAreaViewFlex,
  VerticalList,
  Title,
  TitleContainer,
  TitleShadow,
  VersionNumber
} from '../components';
import { getQuery, QUERY_TYPES } from '../queries';
import { graphqlFetchPolicy } from '../helpers';
import { useMatomoTrackScreenView, useRefreshTime } from '../hooks';

const { MATOMO_TRACKING } = consts;

export const AboutScreen = ({ navigation }) => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const { globalSettings } = useContext(SettingsContext);
  const [refreshing, setRefreshing] = useState(false);

  const refreshTime = useRefreshTime('publicJsonFile-homeAbout');

  useMatomoTrackScreenView(MATOMO_TRACKING.SCREEN_VIEW.MORE);

  if (!refreshTime) {
    return (
      <LoadingContainer>
        <ActivityIndicator color={colors.accent} />
      </LoadingContainer>
    );
  }

  const refresh = async (refetch) => {
    setRefreshing(true);
    isConnected && (await refetch());
    setRefreshing(false);
  };

  const fetchPolicy = graphqlFetchPolicy({
    isConnected,
    isMainserverUp,
    refreshTime
  });
  const { sections = {} } = globalSettings;
  const { headlineAbout = texts.homeTitles.about } = sections;

  return (
    <SafeAreaViewFlex>
      <Query
        query={getQuery(QUERY_TYPES.PUBLIC_JSON_FILE)}
        variables={{ name: 'homeAbout' }}
        fetchPolicy={fetchPolicy}
      >
        {({ data, loading, refetch }) => {
          if (loading) {
            return (
              <LoadingContainer>
                <ActivityIndicator color={colors.accent} />
              </LoadingContainer>
            );
          }

          let publicJsonFileContent = [];

          try {
            publicJsonFileContent = JSON.parse(data?.publicJsonFile?.content);
          } catch (error) {
            console.warn(error, data);
          }

          if (!publicJsonFileContent || !publicJsonFileContent.length) return <VersionNumber />;

          return (
            <>
              {!!headlineAbout && (
                <TitleContainer>
                  <Title accessibilityLabel={`(${headlineAbout}) ${consts.a11yLabel.heading}`}>
                    {headlineAbout}
                  </Title>
                </TitleContainer>
              )}
              {!!headlineAbout && device.platform === 'ios' && <TitleShadow />}
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
                <VerticalList navigation={navigation} data={publicJsonFileContent} noSubtitle />
                <VersionNumber />
              </ScrollView>
            </>
          );
        }}
      </Query>
    </SafeAreaViewFlex>
  );
};

AboutScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
