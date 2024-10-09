// Filter reducer is used to store the filter state in the permanent filter provider
// and to update the filter state in the store

import { storageHelper } from '../helpers';

export enum OverlayFilterAction {
  OverwriteFilter = 'OverwriteFilter'
}

export type OverlayFilterReducerAction = {
  type: OverlayFilterAction.OverwriteFilter;
  payload: string[];
};

export const overlayFilterReducer: React.Reducer<string[], OverlayFilterReducerAction> = (
  state = [],
  action
) => {
  let newState = state;
  switch (action.type) {
    case OverlayFilterAction.OverwriteFilter: {
      newState = [...action.payload];
      break;
    }
  }

  // update the store for next app launch on every change
  storageHelper.setFilter(newState);

  return newState;
};
