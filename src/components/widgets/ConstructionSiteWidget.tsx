import React, { useCallback, useContext, useEffect } from 'react';
import { useQuery } from 'react-apollo';
import { StyleSheet } from 'react-native';
import { NavigationScreenProp } from 'react-navigation';

import { colors, normalize, texts } from '../../config';
import { ConstructionSiteContext } from '../../ConstructionSiteProvider';
import { filterForValidConstructionSites, graphqlFetchPolicy } from '../../helpers';
import { constructionSite } from '../../icons';
import { NetworkContext } from '../../NetworkProvider';
import { getQuery, QUERY_TYPES } from '../../queries';
import { Icon } from '../Icon';
import { BoldText } from '../Text';
import { Touchable } from '../Touchable';
import { Wrapper, WrapperRow } from '../Wrapper';

type Props = {
  navigation: NavigationScreenProp<never>;
};

export const ConstructionSiteWidget = ({ navigation }: Props) => {
  const { constructionSites, setConstructionSites } = useContext(ConstructionSiteContext);
  const { isConnected, isMainserverUp } = useContext(NetworkContext);

  const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp });

  const { data } = useQuery(getQuery(QUERY_TYPES.PUBLIC_JSON_FILE), {
    variables: { name: 'constructionSites' },
    fetchPolicy
  });

  const onPress = useCallback(() => {
    navigation.navigate('ConstructionSiteOverview');
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
        <WrapperRow center>
          <Icon style={styles.icon} xml={constructionSite(colors.primary)} />
          <BoldText primary big>
            {constructionSites.length}
          </BoldText>
        </WrapperRow>
        <BoldText primary small>
          {texts.screenTitles.constructionSites}
        </BoldText>
      </Wrapper>
    </Touchable>
  );
};

const styles = StyleSheet.create({
  icon: {
    paddingHorizontal: normalize(8)
  }
});
