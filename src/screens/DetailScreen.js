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
import { getQuery } from '../queries';
import { arrowLeft, drawerMenu, share } from '../icons';
import { momentFormat, openShare, trimNewLines } from '../helpers';

export class DetailScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const shareContent = navigation.getParam('shareContent', '');

    return {
      headerLeft: (
        <View>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon icon={arrowLeft(colors.lightestText)} style={styles.icon} />
          </TouchableOpacity>
        </View>
      ),
      headerRight: (
        <WrapperRow>
          <TouchableOpacity onPress={() => shareContent && openShare(shareContent)}>
            <Icon icon={share(colors.lightestText)} style={styles.iconLeft} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Icon icon={drawerMenu(colors.lightestText)} style={styles.iconRight} />
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

    /* eslint-disable complexity */
    /* TODO: refactoring to single components */
    const getPage = (query, data) => {
      switch (query) {
      case 'eventRecord': {
        const { createdAt, dates, title, description, mediaContents, dataProvider } = data;

        return {
          subtitle: `${momentFormat(createdAt)} | ${dataProvider && dataProvider.name}`,
          dates, // TODO: need to use dates instead of createdAt in rendering
          title,
          body: description,
          image: mediaContents && mediaContents.length && mediaContents[0].sourceUrl.url,
          logo: dataProvider && dataProvider.logo && dataProvider.logo.url
        };
      }
      case 'newsItem': {
        const { publishedAt, contentBlocks, sourceUrl, dataProvider } = data;

        return {
          subtitle: `${momentFormat(publishedAt)} | ${dataProvider && dataProvider.name}`,
          title: contentBlocks && contentBlocks.length && contentBlocks[0].title,
          body: contentBlocks && contentBlocks.length && contentBlocks[0].body,
          image:
              contentBlocks &&
              contentBlocks.length &&
              contentBlocks[0].mediaContents &&
              contentBlocks[0].mediaContents.length &&
              contentBlocks[0].mediaContents[0].sourceUrl.url,
          link: sourceUrl.url,
          logo: dataProvider && dataProvider.logo && dataProvider.logo.url
        };
      }
      case 'pointOfInterest': {
        const { name, description, category, mediaContents, dataProvider } = data;

        return {
          title: name,
          body: description,
          category,
          image: mediaContents.length && mediaContents[0].sourceUrl.url,
          logo: dataProvider && dataProvider.logo && dataProvider.logo.url
        };
      }
      }
    };
    /* eslint-enable complexity */

    return (
      <Query query={getQuery(query)} variables={queryVariables} fetchPolicy="cache-and-network">
        {({ data, loading }) => {
          if (loading) {
            return (
              <View style={styles.loadingContainer}>
                <ActivityIndicator />
              </View>
            );
          }

          if (!data || !data[query]) return null;

          const page = getPage(query, data[query]);

          if (!page) return null;

          const { subtitle, title, body, image, link, logo } = page;

          return (
            <ScrollView>
              {!!image && <Image source={{ uri: image }} />}
              <Wrapper>
                {!!logo && <Logo source={{ uri: logo }} />}
                {!!subtitle && <ListSubtitle>{subtitle}</ListSubtitle>}
                {/*TODO: map multiple contentBlocks */}
                {!!title && <ListTitle noSubtitle>{title}</ListTitle>}
                {!!body && <HtmlView html={trimNewLines(body)} />}
                {!!link && <Link url={link} title={'Im Browser öffnen'} />}
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
  },
  iconLeft: {
    paddingLeft: normalize(14),
    paddingRight: normalize(7)
  },
  iconRight: {
    paddingLeft: normalize(7),
    paddingRight: normalize(14)
  }
});

DetailScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
