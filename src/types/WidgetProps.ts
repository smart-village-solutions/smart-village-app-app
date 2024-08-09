import { ComponentProps } from 'react';

import { IconSet } from '../config';

export type WidgetProps = {
  additionalProps?: {
    content?: {
      iconName?: string;
      image?: { uri: string };
      title: string;
      params: {
        query: string;
        queryVariables: {};
        title: string;
      };
      routeName: string;
    }[];
    dataProviderId?: string;
    htmlName?: string;
    iconName?: ComponentProps<typeof IconSet>['name'];
    image?: {
      height?: number;
      uri: string;
      width?: number;
    };
    limit?: number;
    noCount?: boolean;
    noFilterByDailyEvents?: boolean;
    staticContentName?: string;
    staticContentTitle?: string;
    webUrl?: string;
  };
  text?: string;
};
