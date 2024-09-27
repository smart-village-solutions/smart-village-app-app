// Filter reducer is used to store the filter state in the permanent filter provider
// and to update the filter state in the store

import { addToStore } from '../helpers';

export const RESOURCE_FILTERS_KEY = 'RESOURCE_FILTERS_KEY';

export enum ResourceFiltersAction {
  AddResourceFilter = 'AddResourceFilter',
  OverwriteResourceFilters = 'OverwriteResourceFilters',
  RemoveResourceFilter = 'RemoveResourceFilter'
}

export type ResourceFiltersReducerAction =
  | {
      type: ResourceFiltersAction.AddResourceFilter;
      payload: { key: string; value: any };
    }
  | {
      type: ResourceFiltersAction.RemoveResourceFilter;
      payload: string;
    }
  | {
      type: ResourceFiltersAction.OverwriteResourceFilters;
      payload: { [key: string]: any };
    };

export const resourceFiltersReducer: React.Reducer<
  { [key: string]: any },
  ResourceFiltersReducerAction
> = (state = {}, action) => {
  let newState = state;
  switch (action.type) {
    case ResourceFiltersAction.AddResourceFilter:
      newState = {
        ...state,
        [action.payload.key]: action.payload.value
      };
      break;
    case ResourceFiltersAction.RemoveResourceFilter:
      const { [action.payload]: _, ...rest } = state;
      newState = rest;
      break;
    case ResourceFiltersAction.OverwriteResourceFilters: {
      newState = { ...action.payload };
      break;
    }
  }

  // update the store for next app launch on every change
  addToStore(RESOURCE_FILTERS_KEY, newState);

  return newState;
};
