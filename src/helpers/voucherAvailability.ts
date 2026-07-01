import moment from 'moment';

import { TQuota, TVoucherDates } from '../types';

type VoucherAvailabilityInput = {
  dates?: TVoucherDates[] | null;
  quota?: Pick<TQuota, 'availableQuantity'> | null;
};

type VoucherRedeemedForMemberInput = {
  availableQuantityForMember?: number | null;
  hasLocalRedemption?: boolean;
};

export const hasVoucherRemainingQuantity = (quota?: Pick<TQuota, 'availableQuantity'> | null) => {
  return quota?.availableQuantity == null || quota.availableQuantity > 0;
};

export const getActiveVoucherDateRange = (dates?: TVoucherDates[] | null) => {
  const now = moment();

  return dates?.find((date) => {
    const hasStarted =
      !date?.dateStart || moment(date.dateStart).startOf('day').isSameOrBefore(now);
    const notExpired = !date?.dateEnd || moment(date.dateEnd).endOf('day').isSameOrAfter(now);

    return hasStarted && notExpired;
  });
};

export const isVoucherDateCurrentlyActive = (dates?: TVoucherDates[] | null) => {
  if (!dates?.length) {
    return true;
  }

  return !!getActiveVoucherDateRange(dates);
};

export const isVoucherCurrentlyAvailable = ({ dates, quota }: VoucherAvailabilityInput) => {
  return hasVoucherRemainingQuantity(quota) && isVoucherDateCurrentlyActive(dates);
};

export const isVoucherRedeemedForMember = ({
  availableQuantityForMember,
  hasLocalRedemption = false
}: VoucherRedeemedForMemberInput) => {
  return availableQuantityForMember === 0 || hasLocalRedemption;
};
