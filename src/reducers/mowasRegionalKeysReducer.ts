import { addToStore } from '../helpers';

export const MOWAS_REGIONAL_KEYS = 'MOWAS_REGIONAL_KEYS';

type MowasRegionalKeysState = string[];

export enum MowasRegionalKeysActions {
  AddMowasRegionalKey = 'AddMowasRegionalKey',
  OverwriteMowasRegionalKeys = 'OverwriteMowasRegionalKeys',
  RemoveMowasRegionalKey = 'RemoveMowasRegionalKey'
}

export type MowasRegionalKeysAction =
  | {
      type:
        | MowasRegionalKeysActions.AddMowasRegionalKey
        | MowasRegionalKeysActions.RemoveMowasRegionalKey;
      payload: string;
    }
  | { type: MowasRegionalKeysActions.OverwriteMowasRegionalKeys; payload: string[] };

export const mowasRegionalKeysReducer = (
  state: MowasRegionalKeysState = [],
  action: MowasRegionalKeysAction
) => {
  let newState = state;

  switch (action.type) {
    case MowasRegionalKeysActions.AddMowasRegionalKey:
      newState = [...state, action.payload];
      break;
    case MowasRegionalKeysActions.RemoveMowasRegionalKey:
      newState = state.filter((id) => id != action.payload);
      break;
    case MowasRegionalKeysActions.OverwriteMowasRegionalKeys:
      newState = [...action.payload];
      break;
  }

  // update the store for next app launch on every change
  addToStore(MOWAS_REGIONAL_KEYS, newState);

  return newState;
};
