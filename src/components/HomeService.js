import React, { useContext } from 'react';
import { StyleSheet, View } from 'react-native';

import { normalize, texts } from '../config';
import { useHomeRefresh, useStaticContent } from '../hooks';
import { SettingsContext } from '../SettingsProvider';

import { DiagonalGradient } from './DiagonalGradient';
import { Service } from './screens/Service';
import { SectionHeader } from './SectionHeader';

export const HomeService = () => {
  const { globalSettings } = useContext(SettingsContext);

  const { data, loading, refetch } = useStaticContent({
    refreshTimeKey: 'publicJsonFile-homeService',
    name: 'homeService',
    type: 'json'
  });

  useHomeRefresh(refetch);

  if (loading || !data?.length) return null;

  const { sections = {} } = globalSettings;
  const { headlineService = texts.homeTitles.service } = sections;

  return (
    <View>
      <SectionHeader title={headlineService} />
      <DiagonalGradient style={styles.padding}>
        <Service data={data} staticJsonName="homeService" hasDiagonalGradientBackground />
      </DiagonalGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  padding: {
    padding: normalize(14)
  }
});
