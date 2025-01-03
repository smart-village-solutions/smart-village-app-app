import { addToStore } from '../helpers';

export const DATA_PROVIDER_FILTER_KEY = 'DATA_PROVIDER_FILTER_KEY';

export enum FilterAction {
  AddDataProvider = 'AddDataProvider',
  OverwriteDataProviders = 'OverwriteDataProviders',
  RemoveDataProvider = 'RemoveDataProvider'
}

export type FilterReducerAction =
  | {
      type: FilterAction.AddDataProvider | FilterAction.RemoveDataProvider;
      payload: string;
    }
  | { type: FilterAction.OverwriteDataProviders; payload: string[] };

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
  }

  // update the store for next app launch on every change
  addToStore(DATA_PROVIDER_FILTER_KEY, newState);

  return newState;
};
