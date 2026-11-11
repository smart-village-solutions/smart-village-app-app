import PropTypes from 'prop-types';
import React, { useContext, useMemo, useState } from 'react';
import { ActivityIndicator, RefreshControl, SectionList } from 'react-native';

import { normalize, texts } from '../../config';
import { useHomeRefresh, useRenderItem, useStaticContent } from '../../hooks';
import { useAboutTranslations } from '../../hooks/homeSettingsTranslations';
import { NetworkContext } from '../../NetworkProvider';
import { QUERY_TYPES } from '../../queries';
import { SettingsContext } from '../../SettingsProvider';
import { LoadingContainer } from '../LoadingContainer';
import { SectionHeader } from '../SectionHeader';
import { VersionNumber } from '../VersionNumber';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import { useTheme } from '../../hooks/useTheme';

const EMPTY_ENTRIES = [];

export const About = ({ navigation, publicJsonFile = 'about', withHomeRefresh, withSettings }) => {
  const { colors: colors } = useTheme();

  const styles = useThemeStyles(createStyles);
  const { data, loading, refetch } = useStaticContent({
    name: publicJsonFile,
    type: 'json',
    refreshTimeKey: `publicJsonFile-${publicJsonFile}`
  });
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const { globalSettings } = useContext(SettingsContext);
  const [refreshing, setRefreshing] = useState(false);
  const sourceEntries = Array.isArray(data) ? data : EMPTY_ENTRIES;
  const headlineAbout = globalSettings.sections?.headlineAbout;
  const source = useMemo(
    () => ({ entries: sourceEntries, headlineAbout }),
    [sourceEntries, headlineAbout]
  );
  const translated = useAboutTranslations(source, isMainserverUp, publicJsonFile);

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

  const entries = translated.entries.map((item) => ({ ...item, isHeadlineTitle: false }));
  if (!entries.length && !withSettings) return <VersionNumber />;

  if (withSettings && !entries.find((item) => item.routeName === 'Settings')) {
    entries.push({
      bottomDivider: true,
      isHeadlineTitle: false,
      routeName: 'Settings',
      title: texts.screenTitles.appSettings
    });
  }

  const sectionData = [
    {
      title:
        translated.headlineAbout === undefined ? texts.homeTitles.about : translated.headlineAbout,
      data: entries
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
      keyExtractor={(item, index) => `${sourceEntries[index]?.title ?? item.title}:${index}`}
      ListFooterComponent={<VersionNumber />}
      style={styles.container}
    />
  );
};

const createStyles = () => ({
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
  publicJsonFile: PropTypes.string,
  withHomeRefresh: PropTypes.bool,
  withSettings: PropTypes.bool
};
