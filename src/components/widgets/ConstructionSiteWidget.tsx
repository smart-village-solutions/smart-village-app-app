import React, { useCallback, useContext, useEffect } from 'react';
import { useQuery } from 'react-apollo';
import { NavigationScreenProp } from 'react-navigation';

import { colors, texts } from '../../config';
import { ConstructionSiteContext } from '../../ConstructionSiteProvider';
import { graphqlFetchPolicy } from '../../helpers';
import { useHomeRefresh } from '../../hooks/HomeRefresh';
import { constructionSite } from '../../icons';
import { filterForValidConstructionSites } from '../../jsonValidation';
import { NetworkContext } from '../../NetworkProvider';
import { getQuery, QUERY_TYPES } from '../../queries';
import { DefaultWidget } from './DefaultWidget';

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
    <DefaultWidget
      icon={constructionSite(colors.primary)}
      number={constructionSites.length}
      onPress={onPress}
      text={texts.widgets.constructionSites}
    />
  );
};
