import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { StyleSheet, View } from 'react-native';

import { consts, device, normalize, texts } from '../../config';
import { useHomeRefresh, useStaticContent } from '../../hooks';
import { SettingsContext } from '../../SettingsProvider';
import { DiagonalGradient } from '../DiagonalGradient';
import { Title, TitleContainer, TitleShadow } from '../Title';
import { WrapperWrap } from '../Wrapper';

import { ServiceTile } from './ServiceTile';

export const Service = ({ navigation }) => {
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
        <WrapperWrap spaceBetween>
          {data.map((item, index) => (
            <ServiceTile
              key={index + item.title}
              navigation={navigation}
              item={item}
              hasDiagonalGradientBackground
            />
          ))}
        </WrapperWrap>
      </DiagonalGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  padding: {
    padding: normalize(14)
  }
});

Service.propTypes = {
  navigation: PropTypes.object.isRequired
};
