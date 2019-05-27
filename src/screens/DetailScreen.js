import PropTypes from 'prop-types';
import React from 'react';
import {
  ActivityIndicator,
  Button,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { Query } from 'react-apollo';

import { colors, texts } from '../config';
import { HtmlView, Link, ListSubtitle, ListTitle, Logo, TopVisual } from '../components';
import { GET_EVENT_RECORD, GET_NEWS_ITEM, GET_POINT_OF_INTEREST } from '../queries';

export class DetailScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const item = navigation.getParam('item', null);
    const title = item ? item.headerTitle : '';

    return {
      title,
      headerLeft: (
        <Button
          title={texts.button.back}
          onPress={() => navigation.goBack()}
          color={Platform.OS === 'ios' ? colors.lightestText : colors.primary}
        />
      ),
      headerRight: (
        <View style={styles.rowContainer}>
          <Button
            title={texts.button.share}
            onPress={() => alert(texts.button.share)}
            color={Platform.OS === 'ios' ? colors.lightestText : colors.primary}
          />
          <Button
            title="="
            onPress={() => navigation.openDrawer()}
            color={Platform.OS === 'ios' ? colors.lightestText : colors.primary}
          />
        </View>
      )
    };
  };

  render() {
    const { navigation } = this.props;
    const query = navigation.getParam('query', '');
    const queryVariables = navigation.getParam('queryVariables', {});

    if (!query) return null;

    const getQuery = (query) => {
      switch (query) {
      case 'eventRecord':
        return GET_EVENT_RECORD;
      case 'newsItem':
        return GET_NEWS_ITEM;
      case 'pointOfInterest':
        return GET_POINT_OF_INTEREST;
      }
    };

    return (
      <ScrollView>
        <Query query={getQuery(query)} variables={queryVariables} fetchPolicy="cache-and-network">
          {({ data, loading }) => {
            if (loading) {
              return (
                <View style={styles.container}>
                  <ActivityIndicator />
                </View>
              );
            }

            const page = data && data[query];

            if (!page) return null;

            const { createdAt, title, body, description } = page;

            return (
              <View>
                <TopVisual />
                <Logo navigation={navigation} />
                {!!createdAt && <ListSubtitle>{createdAt}</ListSubtitle>}
                {/*TODO: map contentBlocks and so on */}
                {!!title && <ListTitle noSubtitle>{title}</ListTitle>}
                {!!body && <Text>{body}</Text>}
                {!!description && <Text>{description}</Text>}
                <HtmlView />
                <Link />
              </View>
            );
          }}
        </Query>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 10
  },
  rowContainer: {
    flexDirection: 'row'
  }
});

DetailScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
