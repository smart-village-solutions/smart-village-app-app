import { addToStore } from '../helpers';
import { FilterAction, FilterReducerAction } from '../types';

export const DATA_PROVIDER_FILTER_KEY = 'DATA_PROVIDER_FILTER_KEY';

export const permanentFilterReducer: React.Reducer<string[], FilterReducerAction> = (
  state = [],
  action
) => {
  let newState = state;
  switch (action.type) {
    case FilterAction.AddDataProvider:
      newState = [...state, action.payload];
      break;
    case FilterAction.RemoveDataProvider:
      newState = state.filter((id) => id != action.payload);
      break;
    case FilterAction.OverwriteDataProviders: {
      newState = [...action.payload];
      break;
    }
    default:
      newState = state;
  }

  // update the store for next app launch on every change
  addToStore(DATA_PROVIDER_FILTER_KEY, newState);

  return newState;
};
