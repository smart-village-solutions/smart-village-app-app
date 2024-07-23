export const calculateBoundsToFitAllMarkers = (coordinates: any) => {
  const [minLng, minLat] = coordinates.reduce(
    (prev, curr) => [Math.min(prev[0], curr[0]), Math.min(prev[1], curr[1])],
    [Infinity, Infinity]
  );

  const [maxLng, maxLat] = coordinates.reduce(
    (prev, curr) => [Math.max(prev[0], curr[0]), Math.max(prev[1], curr[1])],
    [-Infinity, -Infinity]
  );

  const deltaLng = (maxLng - minLng) * 0.1;
  const deltaLat = (maxLat - minLat) * 0.1;

  return { minLng, minLat, maxLng, maxLat, deltaLng, deltaLat };
};
