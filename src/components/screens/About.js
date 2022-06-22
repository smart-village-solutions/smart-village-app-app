import PropTypes from 'prop-types';
import React, { useContext, useState } from 'react';
import { ActivityIndicator, RefreshControl, SectionList } from 'react-native';

import { colors, texts } from '../../config';
import { useHomeRefresh, useRenderItem, useStaticContent } from '../../hooks';
import { NetworkContext } from '../../NetworkProvider';
import { QUERY_TYPES } from '../../queries';
import { SettingsContext } from '../../SettingsProvider';
import { LoadingContainer } from '../LoadingContainer';
import { SectionHeader } from '../SectionHeader';
import { VersionNumber } from '../VersionNumber';

export const About = ({ navigation, withHomeRefresh, withSettings }) => {
  const { data, loading, refetch } = useStaticContent({
    name: 'homeAbout',
    type: 'json',
    refreshTimeKey: 'publicJsonFile-homeAbout'
  });
  const { isConnected } = useContext(NetworkContext);
  const { globalSettings } = useContext(SettingsContext);
  const [refreshing, setRefreshing] = useState(false);

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

  if (loading)
    return withHomeRefresh ? null : (
      <LoadingContainer>
        <ActivityIndicator color={colors.accent} />
      </LoadingContainer>
    );

  if (!data?.length) return <VersionNumber />;

  const { sections = {} } = globalSettings;
  const { headlineAbout = texts.homeTitles.about } = sections;

  const sectionData = [
    {
      title: headlineAbout,
      data
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
      keyExtractor={(item) => item.title}
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
