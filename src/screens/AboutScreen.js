import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { ActivityIndicator, ScrollView } from 'react-native';
import { Query } from 'react-apollo';

import { NetworkContext } from '../NetworkProvider';
import { GlobalSettingsContext } from '../GlobalSettingsProvider';
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

export const AboutScreen = ({ navigation }) => {
  const { isConnected } = useContext(NetworkContext);
  const fetchPolicy = graphqlFetchPolicy(isConnected);
  const globalSettings = useContext(GlobalSettingsContext);
  const { sections } = globalSettings;
  const { headlineAbout = texts.homeTitles.about } = sections;

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
              {!!headlineAbout && (
                <TitleContainer>
                  <Title>{headlineAbout}</Title>
                </TitleContainer>
              )}
              {!!headlineAbout && device.platform === 'ios' && <TitleShadow />}
              <TextList navigation={navigation} data={publicJsonFileContent} noSubtitle />
              <VersionNumber />
            </ScrollView>
          );
        }}
      </Query>
    </SafeAreaViewFlex>
  );
};

AboutScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
