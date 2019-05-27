import PropTypes from 'prop-types';
import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Query } from 'react-apollo';

import { colors, texts } from '../config';
import { HtmlView, Icon, Link, ListSubtitle, ListTitle, Logo, TopVisual } from '../components';
import { GET_EVENT_RECORD, GET_NEWS_ITEM, GET_POINT_OF_INTEREST } from '../queries';
import { arrowLeft, drawerMenu, share } from '../icons';

export class DetailScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerLeft: (
        <View>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon icon={arrowLeft(colors.lightestText)} />
          </TouchableOpacity>
        </View>
      ),
      headerRight: (
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity onPress={() => alert(texts.button.share)}>
            <Icon icon={share(colors.lightestText)} style={{ padding: 10 }} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Icon icon={drawerMenu(colors.lightestText)} style={{ padding: 10 }} />
          </TouchableOpacity>
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
});

DetailScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
