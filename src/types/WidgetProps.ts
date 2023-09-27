export type WidgetProps = {
  additionalProps?: {
    dataProviderId?: string;
    htmlName?: string;
    icon?: string;
    iconName?: string;
    iconSize?: {
      width?: number;
      height?: number;
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
