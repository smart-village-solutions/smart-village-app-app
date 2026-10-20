import { hasVoucherDiscount } from '../../src/helpers/voucherDiscount';

describe('voucher discount eligibility', () => {
  it.each([
    [{ discountPercentage: 15 }, true],
    [{ discountAmount: 5 }, true],
    [{ discountedPrice: 0 }, true],
    [{ originalPrice: 20, discountedPrice: 15 }, true],
    [{ originalPrice: 20, discountPercentage: 15 }, true],
    [{ originalPrice: 20, discountAmount: 5 }, true],
    [{ discountedPrice: 15, discountPercentage: 15 }, true],
    [{ discountedPrice: 15, discountAmount: 5 }, true],
    [{ originalPrice: 20 }, false],
    [{ discountPercentage: 0, discountAmount: 0 }, false],
    [{}, false]
  ])('evaluates discount %p as %p', (discount, expected) => {
    expect(hasVoucherDiscount(discount)).toBe(expected);
  });

  it('rejects missing discount data', () => {
    expect(hasVoucherDiscount(null)).toBe(false);
  });
});
