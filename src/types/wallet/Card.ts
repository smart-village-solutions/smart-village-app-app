import type { ImageStyle } from 'react-native';
import type { BarcodeFormat } from 'react-native-barcode-creator';

export type TCard = {
  apiConnection: TApiConnection;
  balanceAsEuro?: number;
  barcodeFormat?: keyof typeof BarcodeFormat;
  cardName?: string;
  cardNumber: string;
  description?: string;
  iconBackgroundColor: string;
  iconColor: string;
  iconName: string;
  imageStyle?: ImageStyle;
  imageUrl?: string;
  isVisible?: boolean;
  leftIcon: React.ReactNode;
  params?: Record<string, any>;
  pinCode?: string;
  routeName?: string;
  showLiveClock?: boolean;
  subtitle: string;
  title: string;
  type: CardType;
};

export enum CardType {
  BONUS = 'bonus',
  COUPON = 'coupon'
}

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
