import _isEqual from 'lodash/isEqual';

import { ResourceFilterAction } from '../reducers';

export const updateResourceFilterStateHelper = ({
  query,
  queryVariables,
  resourceFilterDispatch,
  resourceFilterState
}: {
  query: string;
  queryVariables: Record<string, any>;
  resourceFilterDispatch?: any;
  resourceFilterState?: Record<string, any>;
}) => {
  const variables: Record<string, any> = { ...queryVariables };

  if (variables.end_date && variables.start_date) {
    variables.dateRange = [variables.start_date, variables.end_date];
  }

  if (
    typeof variables.saveable === 'boolean' &&
    variables.saveable &&
    !_isEqual(variables, resourceFilterState?.[query])
  ) {
    resourceFilterDispatch({
      type: ResourceFilterAction.AddResourceFilter,
      payload: {
        key: query,
        value: { ...variables, ...resourceFilterState?.[query] }
      }
    });
  } else {
    resourceFilterDispatch({
      type: ResourceFilterAction.RemoveResourceFilter,
      payload: query
    });
  }
};
