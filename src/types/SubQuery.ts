import { Icon } from '../config';

export type SubQuery = {
  buttons?: [
    {
      buttonTitle: string;
      icon: keyof typeof Icon;
      iconPosition: 'left' | 'right';
      invert: boolean;
      routeName: string;
      webUrl: string;
    }
  ];
  buttonTitle: string;
  isExternal?: boolean;
  params: { rootRouteName: string; routeName: string; title: string; webUrl: string };
  routeName: string;
  title?: string;
  webUrl?: string;
};
