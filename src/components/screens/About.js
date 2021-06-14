import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { useQuery } from 'react-apollo';
import { View } from 'react-native';

import { device, texts } from '../../config';
import { graphqlFetchPolicy } from '../../helpers';
import { useRefreshTime } from '../../hooks';
import { useHomeRefresh } from '../../hooks/HomeRefresh';
import { NetworkContext } from '../../NetworkProvider';
import { getQuery, QUERY_TYPES } from '../../queries';
import { SettingsContext } from '../../SettingsProvider';
import { TextList } from '../TextList';
import { Title, TitleContainer, TitleShadow } from '../Title';

export const About = ({ navigation }) => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const { globalSettings } = useContext(SettingsContext);

  const refreshTime = useRefreshTime('publicJsonFile-homeAbout');

  const fetchPolicy = graphqlFetchPolicy({
    isConnected,
    isMainserverUp,
    refreshTime
  });

  const { data, loading, refetch } = useQuery(getQuery(QUERY_TYPES.PUBLIC_JSON_FILE), {
    variables: { name: 'homeAbout' },
    fetchPolicy,
    skip: !refreshTime
  });

  useHomeRefresh(refetch);

  if (!refreshTime || loading) return null;

  let publicJsonFileContent = [];

  try {
    publicJsonFileContent = JSON.parse(data?.publicJsonFile?.content);
  } catch (error) {
    console.warn(error, data);
  }

  if (!publicJsonFileContent?.length) return null;

  const { sections = {} } = globalSettings;
  const { headlineAbout = texts.homeTitles.about } = sections;

  return (
    <View>
      {!!headlineAbout && (
        <TitleContainer>
          <Title accessibilityLabel={`${headlineAbout} (Überschrift)`}>{headlineAbout}</Title>
        </TitleContainer>
      )}
      {!!headlineAbout && device.platform === 'ios' && <TitleShadow />}
      <TextList navigation={navigation} data={publicJsonFileContent} noSubtitle />
    </View>
  );
};

About.propTypes = {
  navigation: PropTypes.object.isRequired
};
