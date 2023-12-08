import { addToStore } from '../helpers';

export enum MowasFilterAction {
  AddMowasRegionalKey = 'AddMowasRegionalKey',
  OverwriteMowasRegionalKeys = 'OverwriteMowasRegionalKeys',
  RemoveMowasRegionalKey = 'RemoveMowasRegionalKey'
}

export type MowasFilterReducerAction =
  | {
      type: MowasFilterAction.AddMowasRegionalKey | MowasFilterAction.RemoveMowasRegionalKey;
      payload: string;
    }
  | { type: MowasFilterAction.OverwriteMowasRegionalKeys; payload: string[] };

export const MOWAS_REGIONAL_KEYS = 'MOWAS_REGIONAL_KEYS';

export const mowasRegionalKeysReducer: React.Reducer<string[], MowasFilterReducerAction> = (
  state = [],
  action
) => {
  let newState = state;
  switch (action.type) {
    case MowasFilterAction.AddMowasRegionalKey:
      newState = [...state, action.payload];
      break;
    case MowasFilterAction.RemoveMowasRegionalKey:
      newState = state.filter((id) => id != action.payload);
      break;
    case MowasFilterAction.OverwriteMowasRegionalKeys: {
      newState = [...action.payload];
      break;
    }
  }

  // update the store for next app launch on every change
  addToStore(MOWAS_REGIONAL_KEYS, newState);

  return newState;
};
