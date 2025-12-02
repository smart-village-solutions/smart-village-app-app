export type TVoucherItem = {
  categories: TCategory[];
  params: any;
  contentBlocks: TVoucherContentBlock[];
  dates: TVoucherDates[];
  discountType: TDiscount;
  id: string;
  payload: {
    id: string;
  };
  picture: {
    url: string;
  };
  pointOfInterest: {
    operatingCompany: {
      name: string;
    };
  };
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

export type TVoucherDates = {
  dateEnd: string;
  dateStart: string;
  timeEnd: string;
  timeStart: string;
};

export type TVoucherContentBlock = {
  body: string;
  intro: string;
  title: string;
};

export type TCategory = {
  name: string;
  id: string;
};
