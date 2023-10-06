export type WidgetProps = {
  additionalProps?: {
    dataProviderId?: string;
    htmlName?: string;
    iconName?: string;
    image?: {
      height?: number;
      url: string;
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
