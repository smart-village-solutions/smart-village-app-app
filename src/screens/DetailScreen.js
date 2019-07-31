import PropTypes from 'prop-types';
import React from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { Query } from 'react-apollo';

import { NetworkContext } from '../NetworkProvider';
import { auth } from '../auth';
import { colors, device, normalize } from '../config';
import {
  EventRecord,
  HtmlView,
  Icon,
  Image,
  Logo,
  PointOfInterest,
  RegularText,
  Title,
  TitleContainer,
  TitleShadow,
  Touchable,
  Tour,
  Wrapper,
  WrapperRow
} from '../components';
import { getQuery } from '../queries';
import { arrowLeft, drawerMenu, share } from '../icons';
import { graphqlFetchPolicy, momentFormat, openLink, openShare, trimNewLines } from '../helpers';

export class DetailScreen extends React.PureComponent {
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

  static contextType = NetworkContext;

  componentDidMount() {
    const isConnected = this.context.isConnected;

    isConnected && auth();
  }

  renderScreenComponent(query, data) {
    switch (query) {
    case 'eventRecord':
      return <EventRecord data={data} />;
    case 'pointOfInterest':
      return <PointOfInterest data={data} />;
    case 'tour':
      return <Tour data={data} />;
    }
  }

  /* eslint-disable complexity */
  /* NOTE: we need to check a lot for presence, so this is that complex */
  getPage(query, data) {
    switch (query) {
    case 'newsItem': {
      const { publishedAt, contentBlocks, sourceUrl, dataProvider } = data;

      return {
        subtitle: `${momentFormat(publishedAt)} | ${dataProvider && dataProvider.name}`,
        title: contentBlocks && contentBlocks.length && contentBlocks[0].title,
        body:
            contentBlocks &&
            contentBlocks.length &&
            contentBlocks.map((contentBlock) => contentBlock.body).join(),
        image:
            contentBlocks &&
            contentBlocks.length &&
            contentBlocks[0].mediaContents &&
            contentBlocks[0].mediaContents.length &&
            contentBlocks[0].mediaContents[0].sourceUrl &&
            contentBlocks[0].mediaContents[0].sourceUrl.url,
        link: sourceUrl && sourceUrl.url,
        logo: dataProvider && dataProvider.logo && dataProvider.logo.url
      };
    }
    }
  }
  /* eslint-enable complexity */

  render() {
    const { navigation } = this.props;
    const query = navigation.getParam('query', '');
    const queryVariables = navigation.getParam('queryVariables', {});
    const details = navigation.getParam('details', {});

    if (!query) return null;

    const isConnected = this.context.isConnected;
    const fetchPolicy = graphqlFetchPolicy(isConnected);

    /* eslint-disable complexity */
    /* NOTE: we need to check a lot for presence, so this is that complex */
    return (
      <Query query={getQuery(query)} variables={queryVariables} fetchPolicy={fetchPolicy}>
        {({ data, loading }) => {
          if (loading) {
            return (
              <View style={styles.loadingContainer}>
                <ActivityIndicator />
              </View>
            );
          }

          // we can have `data` from GraphQL or `details` from the previous list view.
          // if there is no cached `data` or network fetched `data` we fallback to the `details`.
          if ((!data || !data[query]) && !details) return null;

          if (query === 'eventRecord' || query === 'pointOfInterest' || query === 'tour') {
            return this.renderScreenComponent(query, (data && data[query]) || details);
          }

          // TODO: put everything in own screen components like PointOfInterest
          const page = this.getPage(query, (data && data[query]) || details);

          if (!page) return null;

          const { subtitle, title, body, image, link, logo } = page;

          return (
            <SafeAreaView>
              <ScrollView>
                {!!image && <Image source={{ uri: image }} />}
                {!!title && !!link ? (
                  <TitleContainer>
                    <Touchable onPress={() => openLink(link)}>
                      <Title>{title}</Title>
                    </Touchable>
                  </TitleContainer>
                ) : (
                  !!title && (
                    <TitleContainer>
                      <Title>{title}</Title>
                    </TitleContainer>
                  )
                )}
                {device.platform === 'ios' && <TitleShadow />}
                <Wrapper>
                  {!!subtitle && <RegularText small>{subtitle}</RegularText>}
                  {!!logo && <Logo source={{ uri: logo }} />}
                  {!!body && <HtmlView html={trimNewLines(body)} />}
                </Wrapper>
              </ScrollView>
            </SafeAreaView>
          );
        }}
      </Query>
    );
    /* eslint-enable complexity */
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
