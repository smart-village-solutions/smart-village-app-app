import PropTypes from 'prop-types';
import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';

import { HtmlView } from '../components';
import { trimNewLines } from '../helpers';

const GET_PUBLIC_HTML_FILE = gql`
  query PublicHtmlFile($name: String!) {
    publicHtmlFile(name: $name) {
      content
    }
  }
`;

export class HtmlScreen extends React.Component {
  render() {
    const { navigation } = this.props;
    const name = navigation.getParam('name', '');

    return (
      <Query query={GET_PUBLIC_HTML_FILE} variables={{ name }} fetchPolicy="cache-and-network">
        {({ data, loading }) => {
          if (loading) {
            return (
              <View style={styles.container}>
                <ActivityIndicator />
              </View>
            );
          }

          return (
            <ScrollView contentContainerStyle={styles.container}>
              {!!data && !!data.publicHtmlFile && (
                <HtmlView html={trimNewLines(data.publicHtmlFile.content)} />
              )}
            </ScrollView>
          );
        }}
      </Query>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 10
  }
});

HtmlScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
