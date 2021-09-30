type LatLon = {
  latitude: number;
  longitude: number;
};

const calculateDistance = (a: LatLon, b: LatLon) =>
  Math.sqrt(Math.pow(a.latitude - b.latitude, 2) + Math.pow(a.longitude - b.longitude, 2));

const sortByDistancesFromPoint = <T>(
  inputArray: T[],
  getLatLon: (value: T) => LatLon | undefined,
  position: LatLon
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
const getLatLonForPOI = (item: any): LatLon | undefined => {
  const latitude = item?.params?.details?.addresses?.[0]?.geoLocation?.latitude;
  const longitude = item?.params?.details?.addresses?.[0]?.geoLocation?.longitude;

  if (latitude && longitude) {
    return { latitude, longitude };
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sortPOIsByDistanceFromPosition = (pointsOfInterest: any[], position: LatLon) =>
  sortByDistancesFromPoint(pointsOfInterest, getLatLonForPOI, position);
