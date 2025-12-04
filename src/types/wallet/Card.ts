export type TCard = {
  apiConnection: TApiConnection;
  cardName?: string;
  cardNumber: string;
  description?: string;
  iconBackgroundColor: string;
  iconColor: string;
  iconName: string;
  leftIcon: React.ReactNode;
  params?: Record<string, any>;
  pinCode?: string;
  routeName?: string;
  subtitle: string;
  title: string;
  type: string;
};

export type TApiConnection = {
  endpoint: string;
  network: string;
  origin: string;
  qrEndpoint: string;
  referer: string;
};

export type TCardInfo = {
  balanceAsCent: number;
  balanceAsEuro: string;
  code: string;
  codeFormated: string;
  expiringCreditAsEuro: string;
  expiringCreditTimeNice: string;
  transactions: TTransaction[];
};

export type TTransaction = {
  dealerName: string;
  timeNice: string;
  type: number;
  valueAsEuro: string;
};
