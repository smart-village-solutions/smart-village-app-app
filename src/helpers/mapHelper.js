import { device } from '../config/device';

export function locationString(address) {
  if (!address) return '';

  return encodeURIComponent(address);
}

// a maps link is different between the platforms
export function locationLink(mapsString) {
  switch (device.platform) {
    case 'ios':
      return `maps:0,0?q=${mapsString}`;
    case 'android':
      return `geo:0,0?q=${mapsString}`;
    default:
      return `https://maps.google.com/?q=${mapsString}`;
  }
}
