import PropTypes from 'prop-types';
import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Query } from 'react-apollo';

import { colors } from '../config';
import { HtmlView, Icon } from '../components';
import { trimNewLines } from '../helpers';
import { GET_PUBLIC_HTML_FILE } from '../queries';
import { arrowLeft } from '../icons';

export class HtmlScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerLeft: (
        <View>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon icon={arrowLeft(colors.lightestText)} />
          </TouchableOpacity>
        </View>
      )
    };
  };

  render() {
    const { navigation } = this.props;
    const queryVariables = navigation.getParam('queryVariables', '');

    if (!queryVariables || !queryVariables.name) return null;

    return (
      <Query
        query={GET_PUBLIC_HTML_FILE}
        variables={{ name: queryVariables.name }}
        fetchPolicy="cache-and-network"
      >
        {({ data, loading }) => {
          if (loading) {
            return (
              <View style={styles.container}>
                <ActivityIndicator />
              </View>
            );
          }

          if (!data || !data.publicHtmlFile || !data.publicHtmlFile.content) return null;

          return (
            <ScrollView>
              <HtmlView html={trimNewLines(data.publicHtmlFile.content)} />
            </ScrollView>
          );
        }}
      </Query>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
});

HtmlScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
