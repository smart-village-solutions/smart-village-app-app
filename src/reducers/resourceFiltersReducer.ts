import { addToStore } from '../helpers';

export const RESOURCE_FILTERS_KEY = 'RESOURCE_FILTERS_KEY';

type ResourceFiltersState = {
  [key: string]: any;
};

export enum ResourceFiltersActions {
  AddResourceFilter = 'AddResourceFilter',
  OverwriteResourceFilters = 'OverwriteResourceFilters',
  RemoveResourceFilter = 'RemoveResourceFilter'
}

export type ResourceFiltersAction =
  | { type: ResourceFiltersActions.AddResourceFilter; payload: { key: string; value: any } }
  | { type: ResourceFiltersActions.RemoveResourceFilter; payload: string }
  | { type: ResourceFiltersActions.OverwriteResourceFilters; payload: { [key: string]: any } };

/**
 * The resource filter reducer is used to store the filter state in the permanent filter provider
 * and to update the filter state in the store.
 */
export const resourceFiltersReducer = (
  state: ResourceFiltersState = {},
  action: ResourceFiltersAction
) => {
  let newState = state;

  switch (action.type) {
    case ResourceFiltersActions.AddResourceFilter:
      newState = {
        ...state,
        [action.payload.key]: action.payload.value
      };
      break;
    case ResourceFiltersActions.RemoveResourceFilter: {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [action.payload]: _, ...rest } = state;
      newState = rest;
      break;
    }
    case ResourceFiltersActions.OverwriteResourceFilters:
      newState = { ...action.payload };
      break;
  }

  // update the store for next app launch on every change
  addToStore(RESOURCE_FILTERS_KEY, newState);

  return newState;
};
