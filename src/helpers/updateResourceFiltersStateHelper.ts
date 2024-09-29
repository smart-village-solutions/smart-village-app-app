import _isEqual from 'lodash/isEqual';

import { ResourceFiltersAction } from '../reducers';

export const updateResourceFiltersStateHelper = ({
  query,
  queryVariables,
  resourceFiltersDispatch,
  resourceFiltersState
}: {
  query: string;
  queryVariables: Record<string, any>;
  resourceFiltersDispatch?: any;
  resourceFiltersState?: Record<string, any>;
}) => {
  const variables: Record<string, any> = { ...queryVariables };

  if (variables.end_date && variables.start_date) {
    variables.dateRange = [variables.start_date, variables.end_date];
  }

  if (
    typeof variables.saveable === 'boolean' &&
    variables.saveable &&
    !_isEqual(variables, resourceFiltersState?.[query])
  ) {
    resourceFiltersDispatch({
      type: ResourceFiltersAction.AddResourceFilter,
      payload: {
        key: query,
        value: { ...variables, ...resourceFiltersState?.[query] }
      }
    });
  }

  if (
    typeof variables.saveable === 'boolean' &&
    !variables.saveable &&
    resourceFiltersState?.[query]
  ) {
    resourceFiltersDispatch({
      type: ResourceFiltersAction.RemoveResourceFilter,
      payload: query
    });
  }
};
