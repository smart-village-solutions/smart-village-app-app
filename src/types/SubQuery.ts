export type SubQuery = {
  buttons?: [{ buttonTitle: string; routeName: string; webUrl: string }];
  buttonTitle: string;
  isExternal?: boolean;
  params: { rootRouteName: string; routeName: string; title: string; webUrl: string };
  routeName: string;
  webUrl?: string;
};
