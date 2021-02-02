import React, { useCallback, useContext, useEffect } from 'react';
import { useQuery } from 'react-apollo';

import { colors, texts } from '../../config';
import { ConstructionSiteContext } from '../../ConstructionSiteProvider';
import { graphqlFetchPolicy } from '../../helpers';
import { useHomeRefresh } from '../../hooks/HomeRefresh';
import { constructionSite } from '../../icons';
import { filterForValidConstructionSites } from '../../jsonValidation';
import { NetworkContext } from '../../NetworkProvider';
import { getQuery, QUERY_TYPES } from '../../queries';
import { WidgetProps } from '../../types';
import { DefaultWidget } from './DefaultWidget';

export const ConstructionSiteWidget = ({ navigation, text }: WidgetProps) => {
  const { constructionSites, setConstructionSites } = useContext(ConstructionSiteContext);
  const { isConnected, isMainserverUp } = useContext(NetworkContext);

  const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp });

  const { data, refetch } = useQuery(getQuery(QUERY_TYPES.PUBLIC_JSON_FILE), {
    variables: { name: 'constructionSites' },
    fetchPolicy
  });

  const onPress = useCallback(() => {
    navigation.navigate('ConstructionSiteOverview', {
      title: text ?? texts.widgets.constructionSites
    });
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
      count={constructionSites.length}
      onPress={onPress}
      text={text ?? texts.widgets.constructionSites}
    />
  );
};
