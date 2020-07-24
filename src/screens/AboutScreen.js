import PropTypes from 'prop-types';
import React from 'react';
import { ActivityIndicator, ScrollView } from 'react-native';
import { Query } from 'react-apollo';

import { NetworkContext } from '../NetworkProvider';
import { colors, device, texts } from '../config';
import {
  LoadingContainer,
  SafeAreaViewFlex,
  TextList,
  Title,
  TitleContainer,
  TitleShadow,
  VersionNumber
} from '../components';
import { getQuery } from '../queries';
import { graphqlFetchPolicy } from '../helpers';

export class AboutScreen extends React.PureComponent {
  static contextType = NetworkContext;

  render() {
    const { navigation } = this.props;
    const { isConnected, isMainserverUp } = this.context;
    const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp });

    return (
      <SafeAreaViewFlex>
        <Query
          query={getQuery('publicJsonFile')}
          variables={{ name: 'homeAbout' }}
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

            let publicJsonFileContent =
              data && data.publicJsonFile && JSON.parse(data.publicJsonFile.content);

            if (!publicJsonFileContent || !publicJsonFileContent.length) return <VersionNumber />;

            return (
              <ScrollView>
                <TitleContainer>
                  <Title>{texts.homeTitles.about}</Title>
                </TitleContainer>
                {device.platform === 'ios' && <TitleShadow />}
                <TextList navigation={navigation} data={publicJsonFileContent} noSubtitle />
                <VersionNumber />
              </ScrollView>
            );
          }}
        </Query>
      </SafeAreaViewFlex>
    );
  }
}

AboutScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
