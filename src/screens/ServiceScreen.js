import PropTypes from 'prop-types';
import React, { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Query } from 'react-apollo';

import { NetworkContext } from '../NetworkProvider';
import { GlobalSettingsContext } from '../GlobalSettingsProvider';
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
import { getQuery } from '../queries';
import { graphqlFetchPolicy, refreshTimeFor } from '../helpers';

export const ServiceScreen = ({ navigation }) => {
  const [refreshTime, setRefreshTime] = useState();
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const globalSettings = useContext(GlobalSettingsContext);

  useEffect(() => {
    const getRefreshTime = async () => {
      const time = await refreshTimeFor('publicJsonFile-homeService', consts.STATIC_CONTENT);

      setRefreshTime(time);
    };

    getRefreshTime();
  }, []);

  if (!refreshTime) {
    return (
      <LoadingContainer>
        <ActivityIndicator color={colors.accent} />
      </LoadingContainer>
    );
  }

  const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp, refreshTime });
  const { sections = {} } = globalSettings;
  const { headlineService = texts.homeTitles.service } = sections;

  return (
    <SafeAreaViewFlex>
      <Query
        query={getQuery('publicJsonFile')}
        variables={{ name: 'homeService' }}
        fetchPolicy={fetchPolicy}
      >
        {({ data, loading }) => {
          if (loading) {
            return (
              <LoadingContainer>
                <ActivityIndicator color={colors.accent} />
              </LoadingContainer>
            );
          }

          let publicJsonFileContent =
            data && data.publicJsonFile && JSON.parse(data.publicJsonFile.content);

          if (!publicJsonFileContent || !publicJsonFileContent.length) return null;

          return (
            <ScrollView>
              {!!headlineService && (
                <TitleContainer>
                  <Title>{headlineService}</Title>
                </TitleContainer>
              )}
              {!!headlineService && device.platform === 'ios' && <TitleShadow />}
              <View style={{ padding: normalize(14) }}>
                <WrapperWrap>
                  {publicJsonFileContent.map((item, index) => {
                    return (
                      <ServiceBox key={index + item.title}>
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
                              />
                            ) : (
                              <Image
                                source={{ uri: item.icon }}
                                style={styles.serviceImage}
                                PlaceholderContent={null}
                              />
                            )}
                            <BoldText small primary center>
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
    resizeMode: 'contain',
    width: '100%'
  }
});

ServiceScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
