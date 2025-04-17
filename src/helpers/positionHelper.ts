import { LocationObject, LocationObjectCoords } from 'expo-location';

// we are not interested in the actual distances in km, but only in relative distances to each other
// this calculates an equirectangular approximation (https://www.movable-type.co.uk/scripts/latlong.html) that is sufficient for our case
// the factor 0.63 was chosen as the average of the values for northern and southern germany (~0.58 and ~0.68 respectively)
const calculateDistance = (a: LocationObjectCoords, b: LocationObjectCoords) =>
  Math.sqrt(Math.pow(a.latitude - b.latitude, 2) + 0.63 * Math.pow(a.longitude - b.longitude, 2));

const sortByDistancesFromPoint = <T>(
  inputArray: T[],
  getLatLon: (value: T) => LocationObjectCoords | undefined,
  position: LocationObjectCoords
): T[] => {
  const sortingArray = inputArray.map((value, index) => {
    const latLon = getLatLon(value);

    return {
      distance: latLon && calculateDistance(latLon, position),
      index
    };
  });

  sortingArray.sort((a, b) => {
    if (a.distance !== undefined && b.distance !== undefined) {
      // if both are defined, compare the distances
      return a.distance - b.distance;
    } else if (a.distance !== undefined) {
      // if only the first one is defined treat it as being closer
      return -1;
    } else if (b.distance !== undefined) {
      // if only the second one is defined treat it as being closer
      return 1;
    } else {
      // if both are undefined, treat them as equal
      return 0;
    }
  });

  return sortingArray.map((value) => inputArray[value.index]);
};

// this gets the position out of the item parsed for displaying in the index screen
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getLatLonForPOI = (item: any): LocationObjectCoords | undefined => {
  const latitude = item?.params?.details?.addresses?.[0]?.geoLocation?.latitude;
  const longitude = item?.params?.details?.addresses?.[0]?.geoLocation?.longitude;

  if (latitude && longitude) {
    return { latitude, longitude };
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sortPOIsByDistanceFromPosition = (
  pointsOfInterest: any[],
  position: LocationObjectCoords
) => sortByDistancesFromPoint(pointsOfInterest, getLatLonForPOI, position);

export const geoLocationToLocationObject = (geoLocation: LocationObjectCoords): LocationObject => {
  return {
    coords: {
      ...geoLocation,
      altitude: null,
      accuracy: null,
      altitudeAccuracy: null,
      heading: null,
      speed: null
    },
    timestamp: new Date().valueOf()
  };
};
