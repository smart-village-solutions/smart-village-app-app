export type TCard = {
  apiEndpoint: string;
  cardName?: string;
  cardNumber: string;
  description?: string;
  iconBackgroundColor: string;
  iconColor: string;
  iconName: string;
  leftIcon: React.ReactNode;
  params?: Record<string, any>;
  pinCode: string;
  routeName?: string;
  subtitle: string;
  title: string;
  type: string;
};
