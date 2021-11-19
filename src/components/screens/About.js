import PropTypes from 'prop-types';
import React, { useContext, useState } from 'react';
import { useQuery } from 'react-apollo';
import { ActivityIndicator, RefreshControl, SectionList } from 'react-native';

import { colors, texts } from '../../config';
import { graphqlFetchPolicy } from '../../helpers';
import { useRefreshTime } from '../../hooks';
import { useHomeRefresh } from '../../hooks/HomeRefresh';
import { NetworkContext } from '../../NetworkProvider';
import { getQuery, QUERY_TYPES } from '../../queries';
import { SettingsContext } from '../../SettingsProvider';
import { LoadingContainer } from '../LoadingContainer';
import { SectionHeader } from '../SectionHeader';
import { VersionNumber } from '../VersionNumber';
import { useRenderItem } from '../../hooks/listHooks';

export const About = ({ navigation, withHomeRefresh, withSettings }) => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const { globalSettings } = useContext(SettingsContext);
  const [refreshing, setRefreshing] = useState(false);

  const refreshTime = useRefreshTime('publicJsonFile-homeAbout');

  const fetchPolicy = graphqlFetchPolicy({
    isConnected,
    isMainserverUp,
    refreshTime
  });

  const { data: aboutData, loading, refetch } = useQuery(getQuery(QUERY_TYPES.PUBLIC_JSON_FILE), {
    variables: { name: 'homeAbout' },
    fetchPolicy,
    skip: !refreshTime
  });

  useHomeRefresh(withHomeRefresh ? refetch : undefined);

  const refresh = async (refetch) => {
    if (withHomeRefresh) {
      return;
    }

    setRefreshing(true);
    isConnected && (await refetch());
    setRefreshing(false);
  };

  const renderItem = useRenderItem(QUERY_TYPES.PUBLIC_JSON_FILE, navigation);

  if (!refreshTime || loading)
    return withHomeRefresh ? null : (
      <LoadingContainer>
        <ActivityIndicator color={colors.accent} />
      </LoadingContainer>
    );

  let publicJsonFileContent = [];

  try {
    publicJsonFileContent = JSON.parse(aboutData?.publicJsonFile?.content);
  } catch (error) {
    console.warn(error, aboutData);
  }

  if (!publicJsonFileContent?.length) return null;

  const { sections = {} } = globalSettings;
  const { headlineAbout = texts.homeTitles.about } = sections;

  const sectionData = [
    {
      title: headlineAbout,
      data: publicJsonFileContent
    }
  ];

  if (withSettings) {
    sectionData.push({
      title: texts.screenTitles.settings,
      data: [
        {
          title: texts.screenTitles.appSettings,
          routeName: 'Settings'
        }
      ]
    });
  }

  return (
    <SectionList
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => refresh(refetch)}
          colors={[colors.accent]}
          tintColor={colors.accent}
        />
      }
      sections={sectionData}
      renderSectionHeader={({ section: { title } }) => <SectionHeader title={title} />}
      renderItem={renderItem}
      ListFooterComponent={<VersionNumber />}
    />
  );
};

About.propTypes = {
  navigation: PropTypes.object.isRequired,
  sectionData: PropTypes.array,
  withHomeRefresh: PropTypes.bool,
  withSettings: PropTypes.bool
};
