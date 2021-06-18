import PropTypes from 'prop-types';
import React, { useContext, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { Query } from 'react-apollo';

import { NetworkContext } from '../NetworkProvider';
import { OrientationContext } from '../OrientationProvider';
import { SettingsContext } from '../SettingsProvider';
import { colors, consts, device, normalize, texts } from '../config';
import {
  BoldText,
  Icon,
  Image,
  LoadingContainer,
  SafeAreaViewFlex,
  ServiceBox,
  Title,
  TitleContainer,
  TitleShadow,
  WrapperWrap
} from '../components';
import { getQuery, QUERY_TYPES } from '../queries';
import { graphqlFetchPolicy } from '../helpers';
import { useMatomoTrackScreenView, useRefreshTime } from '../hooks';

const { MATOMO_TRACKING } = consts;

export const ServiceScreen = ({ navigation }) => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const { orientation, dimensions } = useContext(OrientationContext);
  const { globalSettings } = useContext(SettingsContext);
  const [refreshing, setRefreshing] = useState(false);

  const refreshTime = useRefreshTime('publicJsonFile-homeService');

  useMatomoTrackScreenView(MATOMO_TRACKING.SCREEN_VIEW.SERVICE);

  if (!refreshTime) {
    return (
      <LoadingContainer>
        <ActivityIndicator color={colors.accent} />
      </LoadingContainer>
    );
  }

  const refresh = async (refetch) => {
    setRefreshing(true);
    isConnected && (await refetch());
    setRefreshing(false);
  };

  const fetchPolicy = graphqlFetchPolicy({
    isConnected,
    isMainserverUp,
    refreshTime
  });
  const { sections = {} } = globalSettings;
  const { headlineService = texts.homeTitles.service } = sections;

  return (
    <SafeAreaViewFlex>
      <Query
        query={getQuery(QUERY_TYPES.PUBLIC_JSON_FILE)}
        variables={{ name: 'homeService' }}
        fetchPolicy={fetchPolicy}
      >
        {({ data, loading, refetch }) => {
          if (loading) {
            return (
              <LoadingContainer>
                <ActivityIndicator color={colors.accent} />
              </LoadingContainer>
            );
          }

          let publicJsonFileContent = [];

          try {
            publicJsonFileContent = JSON.parse(data?.publicJsonFile?.content);
          } catch (error) {
            console.warn(error, data);
          }

          if (!publicJsonFileContent || !publicJsonFileContent.length) return null;

          return (
            <>
              {!!headlineService && (
                <TitleContainer>
                  <Title accessibilityLabel={`${headlineService} ${consts.a11yLabel.heading}`}>
                    {headlineService}
                  </Title>
                </TitleContainer>
              )}
              {!!headlineService && device.platform === 'ios' && <TitleShadow />}
              <ScrollView
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={() => refresh(refetch)}
                    colors={[colors.accent]}
                    tintColor={colors.accent}
                  />
                }
              >
                <View style={{ padding: normalize(14) }}>
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
                                <Icon name={item.iconName} size={30} style={styles.serviceIcon} />
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
                                primary
                                center
                                accessibilityLabel={`${item.title} ${consts.a11yLabel.button}`}
                              >
                                {item.title}
                              </BoldText>
                            </View>
                          </TouchableOpacity>
                        </ServiceBox>
                      );
                    })}
                  </WrapperWrap>
                </View>
              </ScrollView>
            </>
          );
        }}
      </Query>
    </SafeAreaViewFlex>
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

ServiceScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
