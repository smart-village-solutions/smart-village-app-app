import React, { useCallback, useContext, useEffect } from 'react';
import { useQuery } from 'react-apollo';
import { StyleSheet } from 'react-native';
import { NavigationScreenProp } from 'react-navigation';

import { colors, normalize, texts } from '../../config';
import { ConstructionSiteContext } from '../../ConstructionSiteProvider';
import { graphqlFetchPolicy } from '../../helpers';
import { useHomeRefresh } from '../../hooks/HomeRefresh';
import { constructionSite } from '../../icons';
import { filterForValidConstructionSites } from '../../jsonValidation';
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

  const { data, refetch } = useQuery(getQuery(QUERY_TYPES.PUBLIC_JSON_FILE), {
    variables: { name: 'constructionSites' },
    fetchPolicy
  });

  const onPress = useCallback(() => {
    navigation.navigate('ConstructionSiteOverview');
  }, [constructionSites, navigation]);

  useHomeRefresh(refetch);

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
