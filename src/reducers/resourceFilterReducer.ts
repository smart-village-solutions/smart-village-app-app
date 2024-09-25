// Filter reducer is used to store the filter state in the permanent filter provider
// and to update the filter state in the store

import { addToStore } from '../helpers';

export const RESOURCE_FILTER_KEY = 'RESOURCE_FILTER_KEY';

export enum ResourceFilterAction {
  AddResourceFilter = 'AddResourceFilter',
  OverwriteResourceFilter = 'OverwriteResourceFilter',
  RemoveResourceFilter = 'RemoveResourceFilter'
}

export type ResourceFilterReducerAction =
  | {
      type: ResourceFilterAction.AddResourceFilter;
      payload: { key: string; value: any };
    }
  | {
      type: ResourceFilterAction.RemoveResourceFilter;
      payload: string;
    }
  | {
      type: ResourceFilterAction.OverwriteResourceFilter;
      payload: { [key: string]: any };
    };

export const resourceFilterReducer: React.Reducer<
  { [key: string]: any },
  ResourceFilterReducerAction
> = (state = {}, action) => {
  let newState = state;
  switch (action.type) {
    case ResourceFilterAction.AddResourceFilter:
      newState = {
        ...state,
        [action.payload.key]: action.payload.value
      };
      break;
    case ResourceFilterAction.RemoveResourceFilter:
      const { [action.payload]: _, ...rest } = state;
      newState = rest;
      break;
    case ResourceFilterAction.OverwriteResourceFilter: {
      newState = { ...action.payload };
      break;
    }
  }

  // update the store for next app launch on every change
  addToStore(RESOURCE_FILTER_KEY, newState);

  return newState;
};
