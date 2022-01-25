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
