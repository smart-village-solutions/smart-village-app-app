import { addToStore } from '../helpers';

export const DATA_PROVIDER_FILTER_KEY = 'DATA_PROVIDER_FILTER_KEY';

type PermanentFilterState = string[];

export enum PermanentFilterActions {
  AddDataProvider = 'AddDataProvider',
  OverwriteDataProviders = 'OverwriteDataProviders',
  RemoveDataProvider = 'RemoveDataProvider'
}

export type PermanentFilterAction =
  | {
      type: PermanentFilterActions.AddDataProvider | PermanentFilterActions.RemoveDataProvider;
      payload: string;
    }
  | { type: PermanentFilterActions.OverwriteDataProviders; payload: string[] };

export const permanentFilterReducer = (
  state: PermanentFilterState = [],
  action: PermanentFilterAction
) => {
  let newState = state;

  switch (action.type) {
    case PermanentFilterActions.AddDataProvider:
      newState = [...state, action.payload];
      break;
    case PermanentFilterActions.RemoveDataProvider:
      newState = state.filter((id) => id != action.payload);
      break;
    case PermanentFilterActions.OverwriteDataProviders: {
      newState = [...action.payload];
      break;
    }
  }

  // update the store for next app launch on every change
  addToStore(DATA_PROVIDER_FILTER_KEY, newState);

  return newState;
};
