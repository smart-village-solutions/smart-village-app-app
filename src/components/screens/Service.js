import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { colors, consts, device, Icon, normalize, texts } from '../../config';
import { useHomeRefresh, useStaticContent } from '../../hooks';
import { OrientationContext } from '../../OrientationProvider';
import { SettingsContext } from '../../SettingsProvider';
import { DiagonalGradient } from '../DiagonalGradient';
import { Image } from '../Image';
import { ServiceBox } from '../ServiceBox';
import { BoldText } from '../Text';
import { Title, TitleContainer, TitleShadow } from '../Title';
import { WrapperWrap } from '../Wrapper';

export const Service = ({ navigation }) => {
  const { orientation, dimensions } = useContext(OrientationContext);
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
      <DiagonalGradient style={{ padding: normalize(14) }}>
        <WrapperWrap spaceBetween>
          {data.map((item, index) => {
            return (
              <ServiceBox
                key={index + item.title}
                orientation={orientation}
                dimensions={dimensions}
              >
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate({
                      name: item.routeName,
                      params: item.params
                    })
                  }
                >
                  <View>
                    {item.iconName ? (
                      <Icon.NamedIcon
                        color={colors.lightestText}
                        name={item.iconName}
                        size={30}
                        style={styles.serviceIcon}
                      />
                    ) : (
                      <Image
                        source={{ uri: item.icon }}
                        style={styles.serviceImage}
                        PlaceholderContent={null}
                        resizeMode="contain"
                      />
                    )}
                    <BoldText
                      small
                      lightest
                      center
                      accessibilityLabel={`(${item.title}) ${consts.a11yLabel.button}`}
                    >
                      {item.title}
                    </BoldText>
                  </View>
                </TouchableOpacity>
              </ServiceBox>
            );
          })}
        </WrapperWrap>
      </DiagonalGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  serviceIcon: {
    alignSelf: 'center',
    paddingVertical: normalize(7.5)
  },
  serviceImage: {
    alignSelf: 'center',
    height: normalize(40),
    marginBottom: normalize(7),
    width: '100%'
  }
});

Service.propTypes = {
  navigation: PropTypes.object.isRequired
};
