import PropTypes from 'prop-types';
import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Query } from 'react-apollo';

import { NetworkContext } from '../../NetworkProvider';
import { consts, device, normalize, texts } from '../../config';
import { DiagonalGradient } from '../DiagonalGradient';
import { Image } from '../Image';
import { ServiceBox } from '../ServiceBox';
import { BoldText } from '../Text';
import { Title, TitleContainer, TitleShadow } from '../Title';
import { WrapperWrap } from '../Wrapper';
import { getQuery } from '../../queries';
import { graphqlFetchPolicy, refreshTimeFor } from '../../helpers';
import TabBarIcon from '../TabBarIcon';

export const Service = ({ navigation }) => {
  const [refreshTime, setRefreshTime] = useState();
  const { isConnected, isMainserverUp } = useContext(NetworkContext);

  useEffect(() => {
    const getRefreshTime = async () => {
      const time = await refreshTimeFor('publicJsonFile-homeService', consts.STATIC_CONTENT);

      setRefreshTime(time);
    };

    getRefreshTime();
  }, []);

  if (!refreshTime) return null;

  const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp, refreshTime });

  return (
    <Query
      query={getQuery('publicJsonFile')}
      variables={{ name: 'homeService' }}
      fetchPolicy={fetchPolicy}
    >
      {({ data, loading }) => {
        if (loading) return null;

        let publicJsonFileContent =
          data && data.publicJsonFile && JSON.parse(data.publicJsonFile.content);

        if (!publicJsonFileContent || !publicJsonFileContent.length) return null;

        return (
          <View>
            <TitleContainer>
              <Title>{texts.homeTitles.service}</Title>
            </TitleContainer>
            {device.platform === 'ios' && <TitleShadow />}
            <DiagonalGradient style={{ padding: normalize(14) }}>
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
                            <TabBarIcon name={item.iconName} size={30} style={styles.serviceIcon} />
                          ) : (
                            <Image
                              source={{ uri: item.icon }}
                              style={styles.serviceImage}
                              PlaceholderContent={null}
                            />
                          )}
                          <BoldText small lightest>
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
      }}
    </Query>
  );
};

const styles = StyleSheet.create({
  serviceIcon: {
    alignSelf: 'center',
    height: normalize(40),
    paddingVertical: normalize(7),
    marginBottom: normalize(7)
  },
  serviceImage: {
    alignSelf: 'center',
    height: normalize(40),
    marginBottom: normalize(7),
    resizeMode: 'contain',
    width: '100%'
  }
});

Service.propTypes = {
  navigation: PropTypes.object.isRequired
};
