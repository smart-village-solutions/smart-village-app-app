import PropTypes from 'prop-types';
import React, { useCallback, useContext, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { normalize } from 'react-native-elements';

import { colors, consts, device, Icon } from '../../config';
import { useStaticContent } from '../../hooks';
import { NetworkContext } from '../../NetworkProvider';
import { OrientationContext } from '../../OrientationProvider';
import { Image } from '../Image';
import { LoadingContainer } from '../LoadingContainer';
import { SafeAreaViewFlex } from '../SafeAreaViewFlex';
import { ServiceBox } from '../ServiceBox';
import { BoldText } from '../Text';
import { Title, TitleContainer, TitleShadow } from '../Title';
import { WrapperWrap } from '../Wrapper';

export const ServiceTiles = ({ navigation, staticJsonName, title }) => {
  const { isConnected } = useContext(NetworkContext);
  const { orientation, dimensions } = useContext(OrientationContext);
  const [refreshing, setRefreshing] = useState(false);

  const { data, loading, refetch } = useStaticContent({
    refreshTimeKey: `publicJsonFile-${staticJsonName}`,
    name: staticJsonName,
    type: 'json'
  });

  const refresh = useCallback(async () => {
    setRefreshing(true);
    isConnected && (await refetch?.());
    setRefreshing(false);
  }, [refetch, isConnected]);

  if (loading) {
    return (
      <LoadingContainer>
        <ActivityIndicator color={colors.accent} />
      </LoadingContainer>
    );
  }

  return (
    <SafeAreaViewFlex>
      <>
        {!!title && (
          <TitleContainer>
            <Title accessibilityLabel={`(${title}) ${consts.a11yLabel.heading}`}>{title}</Title>
          </TitleContainer>
        )}
        {!!title && device.platform === 'ios' && <TitleShadow />}
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
              {data?.map((item, index) => {
                return (
                  <ServiceBox
                    key={index + item.title}
                    orientation={orientation}
                    dimensions={dimensions}
                  >
                    <TouchableOpacity
                      onPress={() => {
                        navigation.push(item.routeName, item.params);
                      }}
                    >
                      <View>
                        {item.iconName ? (
                          <Icon.NamedIcon
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
                          primary
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
          </View>
        </ScrollView>
      </>
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

ServiceTiles.propTypes = {
  navigation: PropTypes.object.isRequired,
  staticJsonName: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired
};
