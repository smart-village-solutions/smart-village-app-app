import React, { useCallback, useContext, useEffect } from 'react';
import { useQuery } from 'react-apollo';
import { StyleSheet, View } from 'react-native';
import { NavigationScreenProp } from 'react-navigation';

import { colors, normalize, texts } from '../../config';
import { ConstructionSiteContext } from '../../ConstructionSiteProvider';
import { filterForValidConstructionSites, graphqlFetchPolicy } from '../../helpers';
import { constructionSite } from '../../icons';
import { NetworkContext } from '../../NetworkProvider';
import { getQuery, QUERY_TYPES } from '../../queries';
import { Icon } from '../Icon';
import { BoldText, RegularText } from '../Text';
import { Touchable } from '../Touchable';
import { Wrapper } from '../Wrapper';

type Props = {
  navigation: NavigationScreenProp<never>;
};

export const ConstructionSiteWidget = ({ navigation }: Props) => {
  const { constructionSites, setConstructionSites } = useContext(ConstructionSiteContext);
  const { isConnected, isMainserverUp } = useContext(NetworkContext);

  const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp, refreshTime: undefined });

  const { data } = useQuery(getQuery(QUERY_TYPES.PUBLIC_JSON_FILE), {
    variables: { name: 'constructionSites' },
    fetchPolicy,
    skip: !isConnected || !isMainserverUp
  });

  const onPress = useCallback(() => {
    if (constructionSites.length) navigation.navigate('ConstructionSiteOverview');
  }, [constructionSites, navigation]);

  useEffect(() => {
    if (data) {
      const constructionSitesPublicJsonFileContent =
        data.publicJsonFile && JSON.parse(data.publicJsonFile.content);

      setConstructionSites(filterForValidConstructionSites(constructionSitesPublicJsonFileContent));
    }
  }, [data, setConstructionSites]);

  return (
    <Touchable onPress={onPress}>
      <Wrapper>
        <View style={styles.container}>
          <Icon style={styles.icon} xml={constructionSite(colors.primary)} />
          <BoldText style={styles.count}>{constructionSites.length}</BoldText>
        </View>
        <RegularText style={styles.text}>{texts.screenTitles.constructionSites}</RegularText>
      </Wrapper>
    </Touchable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center'
  },
  count: {
    // TODO: change this after update with event widget
    color: colors.primary,
    fontSize: normalize(20),
    paddingTop: normalize(4)
  },
  icon: {
    paddingHorizontal: normalize(8)
  },
  text: {
    color: colors.primary
  }
});
