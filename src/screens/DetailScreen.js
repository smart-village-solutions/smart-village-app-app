import PropTypes from 'prop-types';
import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Query } from 'react-apollo';

import { colors, normalize } from '../config';
import {
  HtmlView,
  Icon,
  Image,
  Link,
  ListSubtitle,
  ListTitle,
  Logo,
  Wrapper,
  WrapperRow
} from '../components';
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
        <WrapperRow>
          <TouchableOpacity onPress={() => alert('Share')}>
            <Icon icon={share(colors.lightestText)} style={styles.padding} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Icon icon={drawerMenu(colors.lightestText)} style={styles.padding} />
          </TouchableOpacity>
        </WrapperRow>
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

    const getPage = (query, data) => {
      switch (query) {
      case 'eventRecord': {
        const { createdAt, title, description, mediaContents, dataProvider } = data;

        return {
          createdAt,
          title,
          body: description,
          image: mediaContents[0].sourceUrl.url,
          logo: dataProvider.logo.url
        };
      }
      case 'newsItem': {
        const { createdAt, contentBlocks, sourceUrl, dataProvider } = data;

        return {
          createdAt,
          title: contentBlocks[0].title,
          body: contentBlocks[0].body,
          image: contentBlocks[0].mediaContents[0].sourceUrl.url,
          link: sourceUrl.url,
          logo: dataProvider.logo.url
        };
      }
      case 'pointOfInterest': {
        const { createdAt, name, description, category, mediaContents, dataProvider } = data;

        return {
          createdAt,
          title: name,
          body: description,
          category,
          image: mediaContents[0].sourceUrl.url,
          logo: dataProvider.logo.url
        };
      }
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

            if (!data || !data[query]) return null;

            const page = getPage(query, data[query]);

            if (!page) return null;

            const { createdAt, title, body, image, link, logo } = page;

            return (
              <View>
                {!!image && <Image source={{ uri: image }} />}
                <Wrapper>
                  {!!logo && <Logo navigation={navigation} /* TODO: source={{ uri: logo}} */ />}
                  {!!createdAt && <ListSubtitle>{createdAt}</ListSubtitle>}
                  {/*TODO: map multiple contentBlocks */}
                  {!!title && <ListTitle noSubtitle>{title}</ListTitle>}
                  {!!body && <HtmlView html={body} />}
                  {!!link && <Link url={link} title={'Weiterlesen'} />}
                </Wrapper>
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
  },
  padding: {
    padding: normalize(10)
  }
});

DetailScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
