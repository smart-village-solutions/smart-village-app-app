import PropTypes from 'prop-types';
import React, { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Query } from 'react-apollo';

import { NetworkContext } from '../NetworkProvider';
import { auth } from '../auth';
import { colors, consts, normalize } from '../config';
import { Button, HtmlView, Icon, LoadingContainer, SafeAreaViewFlex, Wrapper } from '../components';
import { graphqlFetchPolicy, refreshTimeFor, trimNewLines } from '../helpers';
import { getQuery } from '../queries';
import { arrowLeft } from '../icons';

export const HtmlScreen = ({ navigation }) => {
  const [refreshTime, setRefreshTime] = useState();
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const query = navigation.getParam('query', '');
  const queryVariables = navigation.getParam('queryVariables', '');

  if (!query || !queryVariables || !queryVariables.name) return null;

  useEffect(() => {
    const getRefreshTime = async () => {
      const time = await refreshTimeFor(`${query}-${queryVariables.name}`, consts.STATIC_CONTENT);

      setRefreshTime(time);
    };

    getRefreshTime();
  }, []);

  useEffect(() => {
    isConnected && auth();
  }, []);

  if (!refreshTime) {
    return (
      <LoadingContainer>
        <ActivityIndicator color={colors.accent} />
      </LoadingContainer>
    );
  }

  const title = navigation.getParam('title', '');
  const rootRouteName = navigation.getParam('rootRouteName', '');
  const subQuery = navigation.getParam('subQuery', '');
  const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp, refreshTime });

  return (
    <Query
      query={getQuery(query)}
      variables={{ name: queryVariables.name }}
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

        if (!data || !data.publicHtmlFile || !data.publicHtmlFile.content) return null;

        return (
          <SafeAreaViewFlex>
            <ScrollView>
              <Wrapper>
                <HtmlView html={trimNewLines(data.publicHtmlFile.content)} />
                {!!subQuery && !!subQuery.routeName && (
                  <Button
                    title={subQuery.buttonTitle || `${title} öffnen`}
                    onPress={() =>
                      navigation.navigate({
                        routeName: subQuery.routeName,
                        params: {
                          title,
                          webUrl: subQuery.webUrl,
                          rootRouteName
                        }
                      })
                    }
                  />
                )}
              </Wrapper>
            </ScrollView>
          </SafeAreaViewFlex>
        );
      }}
    </Query>
  );
};

HtmlScreen.navigationOptions = ({ navigation }) => {
  return {
    headerLeft: (
      <View>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon icon={arrowLeft(colors.lightestText)} style={styles.icon} />
        </TouchableOpacity>
      </View>
    )
  };
};

const styles = StyleSheet.create({
  icon: {
    paddingHorizontal: normalize(14)
  }
});

HtmlScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
