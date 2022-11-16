import React, { useContext } from 'react';
import { StyleSheet, View } from 'react-native';

import { consts, device, normalize, texts } from '../config';
import { useHomeRefresh, useStaticContent } from '../hooks';
import { SettingsContext } from '../SettingsProvider';

import { DiagonalGradient } from './DiagonalGradient';
import { Service } from './screens/Service';
import { Title, TitleContainer, TitleShadow } from './Title';

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
      {!!headlineService && (
        <TitleContainer>
          <Title accessibilityLabel={`(${headlineService}) ${consts.a11yLabel.heading}`}>
            {headlineService}
          </Title>
        </TitleContainer>
      )}
      {!!headlineService && device.platform === 'ios' && <TitleShadow />}
      <DiagonalGradient style={styles.padding}>
        <Service data={data} hasDiagonalGradientBackground staticJsonName="homeService" />
      </DiagonalGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  padding: {
    padding: normalize(14)
  }
});
