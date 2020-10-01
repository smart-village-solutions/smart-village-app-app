import PropTypes from 'prop-types';
import React, { useContext, useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { Query } from 'react-apollo';
import _shuffle from 'lodash/shuffle';

import { NetworkContext } from '../../NetworkProvider';
import { colors, consts } from '../../config';
import { ImagesCarousel } from '../ImagesCarousel';
import { LoadingContainer } from '../LoadingContainer';
import { getQuery, QUERY_TYPES } from '../../queries';
import { graphqlFetchPolicy, refreshTimeFor } from '../../helpers';

export const Carousel = ({ navigation, refreshing }) => {
  const [refreshTime, setRefreshTime] = useState();
  const { isConnected, isMainserverUp } = useContext(NetworkContext);

  useEffect(() => {
    const getRefreshTime = async () => {
      const time = await refreshTimeFor(
        'publicJsonFile-homeCarousel',
        consts.REFRESH_INTERVALS.STATIC_CONTENT
      );

      setRefreshTime(time);
    };

    getRefreshTime();
  }, []);

  if (!refreshTime) {
    return (
      <LoadingContainer>
        <ActivityIndicator color={colors.accent} />
      </LoadingContainer>
    );
  }

  const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp, refreshTime });

  return (
    <Query
      query={getQuery(QUERY_TYPES.PUBLIC_JSON_FILE)}
      variables={{ name: 'homeCarousel' }}
      fetchPolicy={fetchPolicy}
    >
      {({ data, loading, refetch }) => {
        // call the refetch method of Apollo after `refreshing` is given with `true`, which happens
        // when pull to refresh is used in the parent component
        if (refreshing) refetch();
        if (loading) {
          return (
            <LoadingContainer>
              <ActivityIndicator color={colors.accent} />
            </LoadingContainer>
          );
        }

        let carouselImages = data && data.publicJsonFile && JSON.parse(data.publicJsonFile.content);

        if (!carouselImages) return null;

        return (
          <ImagesCarousel
            navigation={navigation}
            data={_shuffle(carouselImages)}
            fetchPolicy={fetchPolicy}
          />
        );
      }}
    </Query>
  );
};

Carousel.propTypes = {
  navigation: PropTypes.object.isRequired,
  refreshing: PropTypes.bool
};

Carousel.defaultProps = {
  refreshing: false
};
