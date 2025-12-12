import PropTypes from 'prop-types';
import { useQuery } from 'react-apollo';

import { ConsulClient } from '../../ConsulClient';
import { getQuery, QUERY_TYPES } from '../../queries';

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

const usePolls = ({ query, queryVariables }) => {
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

const usePoll = ({ query, queryVariables }) => {
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

const useUser = ({ query, queryVariables }) => {
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

const usePublicComment = ({ query, queryVariables }) => {
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
    case QUERY_TYPES.CONSUL.DEBATES:
      return useDebates({ query, queryVariables });
    case QUERY_TYPES.CONSUL.DEBATE:
      return useDebate({ query, queryVariables });
    case QUERY_TYPES.CONSUL.PROPOSALS:
      return useProposals({ query, queryVariables });
    case QUERY_TYPES.CONSUL.PROPOSAL:
      return useProposal({ query, queryVariables });
    case QUERY_TYPES.CONSUL.POLLS:
      return usePolls({ query, queryVariables });
    case QUERY_TYPES.CONSUL.POLL:
      return usePoll({ query, queryVariables });
    case QUERY_TYPES.CONSUL.USER:
      return useUser({ query, queryVariables });
    case QUERY_TYPES.CONSUL.PUBLIC_COMMENT:
      return usePublicComment({ query, queryVariables });
    default:
      return null;
  }
};

useConsulData.propTypes = {
  query: PropTypes.object,
  queryVariables: PropTypes.object
};
