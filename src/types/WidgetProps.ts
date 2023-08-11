export type WidgetProps = {
  text?: string;
  additionalProps?: {
    dataProviderId?: string;
    iconName?: string;
    noCount?: boolean;
    noFilterByDailyEvents?: boolean;
    staticContentName?: string;
    staticContentTitle?: string;
    limit?: number;
  };
};
