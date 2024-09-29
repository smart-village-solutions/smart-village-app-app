const deg2rad = (deg: number) => deg * (Math.PI / 180);

const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

export const filterLocationsWithinRadius = (
  listItem: any,
  currentLat: number,
  currentLon: number,
  radiusInKm: number
) =>
  listItem.filter((location: any) => {
    const latitude = location.addresses?.[0]?.geoLocation?.latitude;
    const longitude = location.addresses?.[0]?.geoLocation?.longitude;

    if (latitude == null || longitude == null) {
      return false;
    }

    const distance = getDistanceFromLatLonInKm(currentLat, currentLon, latitude, longitude);

    return distance <= radiusInKm;
  });
