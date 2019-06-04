import PropTypes from 'prop-types';
import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Query } from 'react-apollo';

import { auth } from '../auth';
import { colors, normalize } from '../config';
import { Button, HtmlView, Icon, Wrapper } from '../components';
import { trimNewLines } from '../helpers';
import { getQuery } from '../queries';
import { arrowLeft } from '../icons';

export class HtmlScreen extends React.PureComponent {
  static navigationOptions = ({ navigation }) => {
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

  componentDidMount() {
    auth();
  }

  render() {
    const { navigation } = this.props;
    const queryVariables = navigation.getParam('queryVariables', '');
    const title = navigation.getParam('title', '');
    const webUrl = navigation.getParam('webUrl', '');

    if (!queryVariables || !queryVariables.name) return null;

    return (
      <Query
        query={getQuery('publicHtmlFile')}
        variables={{ name: queryVariables.name }}
        fetchPolicy="cache-and-network"
      >
        {({ data, loading }) => {
          if (loading) {
            return (
              <View style={styles.loadingContainer}>
                <ActivityIndicator />
              </View>
            );
          }

          if (!data || !data.publicHtmlFile || !data.publicHtmlFile.content) return null;

          return (
            <ScrollView>
              <Wrapper>
                <HtmlView html={trimNewLines(data.publicHtmlFile.content)} />
                {!!webUrl && (
                  <Button
                    title={`${title} öffnen`}
                    onPress={() =>
                      navigation.navigate({
                        routeName: 'Web',
                        params: {
                          title,
                          webUrl
                        }
                      })
                    }
                  />
                )}
              </Wrapper>
            </ScrollView>
          );
        }}
      </Query>
    );
  }
}

const styles = StyleSheet.create({
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center'
  },
  icon: {
    paddingHorizontal: normalize(14)
  }
});

HtmlScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
