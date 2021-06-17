import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useQuery } from 'react-apollo';

import { NetworkContext } from '../../NetworkProvider';
import { OrientationContext } from '../../OrientationProvider';
import { SettingsContext } from '../../SettingsProvider';
import { colors, consts, device, normalize, texts } from '../../config';
import { DiagonalGradient } from '../DiagonalGradient';
import { Image } from '../Image';
import { ServiceBox } from '../ServiceBox';
import { BoldText } from '../Text';
import { Title, TitleContainer, TitleShadow } from '../Title';
import { WrapperWrap } from '../Wrapper';
import { getQuery, QUERY_TYPES } from '../../queries';
import { Icon } from '../Icon';
import { graphqlFetchPolicy } from '../../helpers';
import { useRefreshTime } from '../../hooks';
import { useHomeRefresh } from '../../hooks/HomeRefresh';

export const Service = ({ navigation }) => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const { orientation, dimensions } = useContext(OrientationContext);
  const { globalSettings } = useContext(SettingsContext);

  const refreshTime = useRefreshTime('publicJsonFile-homeService');

  const fetchPolicy = graphqlFetchPolicy({
    isConnected,
    isMainserverUp,
    refreshTime
  });

  const { data, loading, refetch } = useQuery(getQuery(QUERY_TYPES.PUBLIC_JSON_FILE), {
    variables: { name: 'homeService' },
    fetchPolicy,
    skip: !refreshTime
  });

  useHomeRefresh(refetch);

  if (!refreshTime || loading) return null;

  let publicJsonFileContent = [];

  try {
    publicJsonFileContent = JSON.parse(data?.publicJsonFile?.content);
  } catch (error) {
    console.warn(error, data);
  }

  if (!publicJsonFileContent?.length) return null;

  const { sections = {} } = globalSettings;
  const { headlineService = texts.homeTitles.service } = sections;

  return (
    <View>
      {!!headlineService && (
        <TitleContainer>
          <Title accessibilityLabel={(`${headlineService}`, consts.a11yLabel.heading)}>
            {headlineService}
          </Title>
        </TitleContainer>
      )}
      {!!headlineService && device.platform === 'ios' && <TitleShadow />}
      <DiagonalGradient style={{ padding: normalize(14) }}>
        <WrapperWrap spaceBetween>
          {publicJsonFileContent.map((item, index) => {
            return (
              <ServiceBox
                key={index + item.title}
                orientation={orientation}
                dimensions={dimensions}
              >
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate({
                      routeName: item.routeName,
                      params: item.params
                    })
                  }
                >
                  <View>
                    {item.iconName ? (
                      <Icon
                        name={item.iconName}
                        size={30}
                        style={styles.serviceIcon}
                        iconColor={colors.lightestText}
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
                      accessibilityLabel={(`${item.title}`, consts.a11yLabel.button)}
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
