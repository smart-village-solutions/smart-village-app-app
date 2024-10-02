import PropTypes from 'prop-types';
import React, { useContext, useState } from 'react';
import { ActivityIndicator, RefreshControl, SectionList, StyleSheet } from 'react-native';

import { colors, normalize, texts } from '../../config';
import { useHomeRefresh, useRenderItem, useStaticContent } from '../../hooks';
import { NetworkContext } from '../../NetworkProvider';
import { QUERY_TYPES } from '../../queries';
import { SettingsContext } from '../../SettingsProvider';
import { LoadingContainer } from '../LoadingContainer';
import { SectionHeader } from '../SectionHeader';
import { VersionNumber } from '../VersionNumber';

export const About = ({ navigation, publicJsonFile = 'about', withHomeRefresh, withSettings }) => {
  const { data, loading, refetch } = useStaticContent({
    name: publicJsonFile,
    type: 'json',
    refreshTimeKey: `publicJsonFile-${publicJsonFile}`
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
        <ActivityIndicator color={colors.refreshControl} />
      </LoadingContainer>
    );

  if (!data?.length) return <VersionNumber />;

  data.forEach((item) => (item.isHeadlineTitle = false));

  const { sections = {} } = globalSettings;
  const { headlineAbout = texts.homeTitles.about } = sections;

  if (withSettings && !data.find((item) => item.routeName === 'Settings')) {
    data.push({
      isHeadlineTitle: false,
      routeName: 'Settings',
      title: texts.screenTitles.appSettings
    });
  }

  const sectionData = [
    {
      title: headlineAbout,
      data
    }
  ];

  return (
    <SectionList
      initialNumToRender={100}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => refresh(refetch)}
          colors={[colors.refreshControl]}
          tintColor={colors.refreshControl}
        />
      }
      sections={sectionData}
      renderSectionHeader={({ section: { title } }) =>
        !!title && <SectionHeader title={title} containerStyle={styles.sectionHeader} />
      }
      renderItem={renderItem}
      keyExtractor={(item) => item.title}
      ListFooterComponent={<VersionNumber />}
      style={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: normalize(14)
  },
  sectionHeader: {
    paddingLeft: 0,
    paddingRight: 0
  }
});

About.propTypes = {
  navigation: PropTypes.object.isRequired,
  sectionData: PropTypes.array,
  publicJsonFile: PropTypes.string,
  withHomeRefresh: PropTypes.bool,
  withSettings: PropTypes.bool
};
