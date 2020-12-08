import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Query } from 'react-apollo';

import { NetworkContext } from '../../NetworkProvider';
import { OrientationContext } from '../../OrientationProvider';
import { SettingsContext } from '../../SettingsProvider';
import { colors, device, normalize, texts } from '../../config';
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

export const Service = ({ navigation, refreshing }) => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const { orientation, dimensions } = useContext(OrientationContext);
  const { globalSettings } = useContext(SettingsContext);

  const refreshTime = useRefreshTime('publicJsonFile-homeService');

  if (!refreshTime) return null;

  const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp, refreshTime });
  const { sections = {} } = globalSettings;
  const { headlineService = texts.homeTitles.service } = sections;

  return (
    <Query
      query={getQuery(QUERY_TYPES.PUBLIC_JSON_FILE)}
      variables={{ name: 'homeService' }}
      fetchPolicy={fetchPolicy}
    >
      {({ data, loading, refetch }) => {
        // call the refetch method of Apollo after `refreshing` is given with `true`, which happens
        // when pull to refresh is used in the parent component
        if (refreshing) refetch();
        if (loading) return null;

        let publicJsonFileContent =
          data && data.publicJsonFile && JSON.parse(data.publicJsonFile.content);

        if (!publicJsonFileContent || !publicJsonFileContent.length) return null;

        return (
          <View>
            {!!headlineService && (
              <TitleContainer>
                <Title accessibilityLabel={`${headlineService} (Überschrift)`}>
                  {headlineService}
                </Title>
              </TitleContainer>
            )}
            {!!headlineService && device.platform === 'ios' && <TitleShadow />}
            <DiagonalGradient style={{ padding: normalize(14) }}>
              <WrapperWrap>
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
                            />
                          )}
                          <BoldText
                            small
                            lightest
                            center
                            accessibilityLabel={`${item.title} (Taste)`}
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
      }}
    </Query>
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

Service.propTypes = {
  navigation: PropTypes.object.isRequired,
  refreshing: PropTypes.bool
};

Service.defaultProps = {
  refreshing: false
};
