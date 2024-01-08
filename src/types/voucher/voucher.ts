export type TVoucherItem = {
  categories: {
    name: string;
  }[];
  params: any;
  contentBlocks: TVoucherContentBlock[];
  dates: TVoucherDates[];
  discountType: TDiscount;
  id: string;
  quota: TQuota;
  routeName: string;
  subtitle: string;
  title: string;
};

export type TDiscount = {
  discountAmount: number;
  discountedPrice: number;
  discountPercentage: number;
  originalPrice: number;
};

export type TQuota = {
  availableQuantity: number;
  availableQuantityForMember: number;
  frequency: string;
  maxPerPerson: number;
  maxQuantity: number;
};

type TVoucherDates = {
  dateEnd: string;
  dateStart: string;
  timeEnd: string;
  timeStart: string;
};

type TVoucherContentBlock = {
  body: string;
  intro: string;
  title: string;
};
