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

export const About = ({ navigation, withHomeRefresh, withSettings }) => {
  const { data, loading, refetch } = useStaticContent({
    name: 'about',
    type: 'json',
    refreshTimeKey: 'publicJsonFile-about'
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

  // add a isHeadlineTitle: false to every item in the data array
  data.forEach((item) => (item.isHeadlineTitle = false));

  const { sections = {} } = globalSettings;
  const { headlineAbout = texts.homeTitles.about } = sections;

  const sectionData = [
    {
      title: headlineAbout,
      data: [
        ...data,
        withSettings && {
          isHeadlineTitle: false,
          routeName: 'Settings',
          title: texts.screenTitles.appSettings
        }
      ]
    }
  ];

  return (
    <SectionList
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
    paddingHorizontal: normalize(16)
  },
  sectionHeader: {
    paddingLeft: 0,
    paddingRight: 0
  }
});

About.propTypes = {
  navigation: PropTypes.object.isRequired,
  sectionData: PropTypes.array,
  withHomeRefresh: PropTypes.bool,
  withSettings: PropTypes.bool
};
