import PropTypes from 'prop-types';
import { useQuery } from 'react-apollo';

import { QUERY_TYPES } from '../../queries';
import { getQuery } from '../../queries';
import { ConsulClient } from '../../ConsulClient';

const QUERIES = QUERY_TYPES.CONSUL;

export const useConsulData = ({ query, queryVariables }) => {
  const { data, loading, error, refetch } = useQuery(getQuery(query), {
    client: ConsulClient,
    variables: queryVariables
  });

  switch (query) {
    case QUERIES.DEBATES:
      return {
        isLoading: loading,
        isError: error,
        data,
        refetch
      };

    default:
      return null;
  }
};

useConsulData.propTypes = {
  query: PropTypes.object,
  queryVariables: PropTypes.object
};
