import { TDiscount } from '../types';

const isNumber = (value: number | null | undefined): value is number =>
  typeof value === 'number' && Number.isFinite(value);

export const hasVoucherDiscount = (discount?: TDiscount | null) =>
  !!discount &&
  ((isNumber(discount.discountPercentage) && discount.discountPercentage > 0) ||
    (isNumber(discount.discountAmount) && discount.discountAmount > 0) ||
    (isNumber(discount.discountedPrice) && discount.discountedPrice >= 0));
