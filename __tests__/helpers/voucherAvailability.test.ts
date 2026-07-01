import {
  getActiveVoucherDateRange,
  hasVoucherRemainingQuantity,
  isVoucherCurrentlyAvailable,
  isVoucherDateCurrentlyActive,
  isVoucherRedeemedForMember
} from '../../src/helpers/voucherAvailability';

describe('voucher availability helpers', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-07-01T12:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('treats vouchers without dates as currently active', () => {
    expect(isVoucherDateCurrentlyActive(undefined)).toBe(true);
    expect(isVoucherDateCurrentlyActive([])).toBe(true);
  });

  it('treats missing date boundaries as open-ended', () => {
    expect(
      isVoucherDateCurrentlyActive([
        {
          dateStart: '',
          dateEnd: '2026-07-10',
          timeStart: '',
          timeEnd: ''
        }
      ])
    ).toBe(true);

    expect(
      isVoucherDateCurrentlyActive([
        {
          dateStart: '2026-06-10',
          dateEnd: '',
          timeStart: '',
          timeEnd: ''
        }
      ])
    ).toBe(true);
  });

  it('treats a voucher as active when any date range is active', () => {
    expect(
      isVoucherDateCurrentlyActive([
        {
          dateStart: '2026-08-01',
          dateEnd: '2026-08-10',
          timeStart: '',
          timeEnd: ''
        },
        {
          dateStart: '2026-06-25',
          dateEnd: '2026-07-05',
          timeStart: '',
          timeEnd: ''
        }
      ])
    ).toBe(true);
  });

  it('treats depleted quota as unavailable', () => {
    expect(hasVoucherRemainingQuantity({ availableQuantity: 0 })).toBe(false);
    expect(hasVoucherRemainingQuantity({ availableQuantity: 2 })).toBe(true);
    expect(hasVoucherRemainingQuantity({ availableQuantity: null })).toBe(true);
    expect(hasVoucherRemainingQuantity({ availableQuantity: undefined })).toBe(true);
  });

  it('combines date and quota availability consistently', () => {
    expect(
      isVoucherCurrentlyAvailable({
        dates: [
          {
            dateStart: '2026-08-01',
            dateEnd: '2026-08-10',
            timeStart: '',
            timeEnd: ''
          },
          {
            dateStart: '2026-06-25',
            dateEnd: '2026-07-05',
            timeStart: '',
            timeEnd: ''
          }
        ],
        quota: { availableQuantity: 3 }
      })
    ).toBe(true);

    expect(
      isVoucherCurrentlyAvailable({
        dates: [
          {
            dateStart: '2026-08-01',
            dateEnd: '2026-08-10',
            timeStart: '',
            timeEnd: ''
          }
        ],
        quota: { availableQuantity: 3 }
      })
    ).toBe(false);
  });

  it('returns the active voucher date range instead of always using the first one', () => {
    expect(
      getActiveVoucherDateRange([
        {
          dateStart: '2026-06-01',
          dateEnd: '2026-06-10',
          timeStart: '',
          timeEnd: ''
        },
        {
          dateStart: '2026-06-25',
          dateEnd: '2026-07-05',
          timeStart: '',
          timeEnd: ''
        }
      ])
    ).toEqual({
      dateStart: '2026-06-25',
      dateEnd: '2026-07-05',
      timeStart: '',
      timeEnd: ''
    });
  });

  it('keeps member-exhausted vouchers redeemed regardless of local transaction lookup', () => {
    expect(
      isVoucherRedeemedForMember({
        availableQuantityForMember: 0,
        hasLocalRedemption: false
      })
    ).toBe(true);

    expect(
      isVoucherRedeemedForMember({
        availableQuantityForMember: 2,
        hasLocalRedemption: true
      })
    ).toBe(true);

    expect(
      isVoucherRedeemedForMember({
        availableQuantityForMember: 2,
        hasLocalRedemption: false
      })
    ).toBe(false);
  });
});
