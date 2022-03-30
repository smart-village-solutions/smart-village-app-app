import PropTypes from 'prop-types';
import { useQuery } from 'react-apollo';

import { QUERY_TYPES } from '../../queries';
import { getQuery } from '../../queries';
import { ConsulClient } from '../../ConsulClient';

const QUERIES = QUERY_TYPES.CONSUL;

const useDebates = ({ query, queryVariables }) => {
  const { data, loading, error, refetch } = useQuery(getQuery(query), {
    client: ConsulClient,
    variables: queryVariables
  });

  return {
    isLoading: loading,
    isError: error,
    data,
    refetch
  };
};

const useDebate = ({ query, queryVariables }) => {
  const { data, loading, error, refetch } = useQuery(getQuery(query), {
    client: ConsulClient,
    variables: queryVariables
  });

  return {
    isLoading: loading,
    isError: error,
    data,
    refetch
  };
};

const useProposals = ({ query, queryVariables }) => {
  const { data, loading, error, refetch } = useQuery(getQuery(query), {
    client: ConsulClient,
    variables: queryVariables
  });

  return {
    isLoading: loading,
    isError: error,
    data,
    refetch
  };
};

const useProposal = ({ query, queryVariables }) => {
  const { data, loading, error, refetch } = useQuery(getQuery(query), {
    client: ConsulClient,
    variables: queryVariables
  });

  return {
    isLoading: loading,
    isError: error,
    data,
    refetch
  };
};

export const useConsulData = ({ query, queryVariables }) => {
  switch (query) {
    case QUERIES.DEBATES:
      return useDebates({ query, queryVariables });
    case QUERIES.DEBATE:
      return useDebate({ query, queryVariables });
    case QUERIES.PROPOSALS:
      return useProposals({ query, queryVariables });
    case QUERIES.PROPOSAL:
      return useProposal({ query, queryVariables });
    default:
      null;
  }
};

useConsulData.propTypes = {
  query: PropTypes.object,
  queryVariables: PropTypes.object
};
