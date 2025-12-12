import { device } from '../config/device';

export function locationString(address) {
  if (!address) return '';

  return encodeURIComponent(address);
}

/**
 * a maps link is different between the platforms
 * @param {string} mapsString
 * @param {{
    latitude: number;
    longitude: number;
  } | undefined } geoLocation
 * @returns
 */
export function locationLink(mapsString, geoLocation) {
  const coords = geoLocation ? `${geoLocation.latitude},${geoLocation.longitude}` : undefined;

  switch (device.platform) {
    case 'ios':
      return coords ? `maps:?q=${mapsString}&ll=${coords}` : `maps:?q=${mapsString}`;
    case 'android':
      return coords ? `geo:${coords}?q=${coords}(${mapsString})` : `geo:0,0?q=${mapsString}`;
    default:
      return `https://maps.google.com/?q=${mapsString}`;
  }
}

export const getBounds = (locations) => {
  const latitudes = locations.map((l) => l.position.latitude);
  const longitudes = locations.map((l) => l.position.longitude);

  const north = Math.max(...latitudes);
  const south = Math.min(...latitudes);
  const east = Math.max(...longitudes);
  const west = Math.min(...longitudes);

  return {
    ne: [east, north],
    sw: [west, south]
  };
};
