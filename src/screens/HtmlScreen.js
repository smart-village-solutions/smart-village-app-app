import PropTypes from 'prop-types';
import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { Query } from 'react-apollo';

import { HtmlView } from '../components';
import { trimNewLines } from '../helpers';
import { GET_PUBLIC_HTML_FILE } from '../queries';

export const HtmlScreen = (props) => {
  const { navigation } = props;
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
          <ScrollView contentContainerStyle={styles.container}>
            <HtmlView html={trimNewLines(data.publicHtmlFile.content)} />
          </ScrollView>
        );
      }}
    </Query>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 10
  }
});

HtmlScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
