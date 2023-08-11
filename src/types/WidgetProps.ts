export type WidgetProps = {
  additionalProps?: {
    dataProviderId?: string;
    iconName?: string;
    limit?: number;
    noCount?: boolean;
    noFilterByDailyEvents?: boolean;
    staticContentName?: string;
    staticContentTitle?: string;
  };
  text?: string;
};
