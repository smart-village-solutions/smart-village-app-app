import { device } from '../config';
/**
 * Formatting floating-point numbers from data in to prices (1.2 => 1,20 EUR)
 *
 * @param {number} price the required number to format
 *
 * @return {string} a formatted string in the de-DE locale and with currency code
 */
export const priceFormat = (price) => {
  if (device.platform === 'ios') {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      currencyDisplay: 'code'
    }).format(price);
  }

  // Error with Intl.NumberFormat for Android: `Can't find variable: Intl`,
  // so we need a workaround here
  return `${price.toFixed(2)}`.replace('.', ',') + ' EUR';
};
