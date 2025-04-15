import { consts } from '../../config';
import { MapMarker } from '../../types';
import { useStaticContent } from '../staticContent';

const { MAP, REFRESH_INTERVALS } = consts;

export const useMapSettings = () => {
  const { data, loading } = useStaticContent({
    name: 'mapSettings',
    refreshInterval: REFRESH_INTERVALS.ONCE_PER_HOUR,
    refreshTimeKey: 'map-settings',
    type: 'json'
  });

  return {
    data,
    loading
  };
};

/**
 * Generates a dynamic `circleColor` expression for a cluster layer.
 *
 * - If two or more of the defined `types` have values > 1 in a cluster, it uses `clusterSuperiorColor`.
 * - Otherwise, it picks the color from `markerImages` based on the first type with a value > 1.
 * - Falls back to `clusterFallbackColor` if none match.
 *
 * This leverages Mapbox expression syntax:
 * https://docs.mapbox.com/mapbox-gl-js/style-spec/expressions/
 */
const createCircleColorExpression = (
  types: (string | undefined)[],
  markerImages: Record<string, { color: string }>,
  clusterSuperiorColor: string,
  clusterFallbackColor: string
) => [
  'case',
  [
    '>=',
    [
      '+',
      ...(types?.map((type) => ['case', ['>', ['coalesce', ['get', type], 0], 1], 1, 0]) ?? [])
    ],
    2
  ],
  clusterSuperiorColor,
  ...((types || [])?.flatMap((type) => [
    ['>', ['coalesce', ['get', type], 0], 1],
    markerImages?.[type]?.color
  ]) ?? []),
  clusterFallbackColor
];

/**
 * Creates a `clusterProperties` object for MapLibre's clustering, to apply a count for each feature type.
 *
 * For each given feature type, this function generates an aggregation rule:
 * - The first entry is the reduce expression: it adds the current feature value to the accumulated total.
 * - The second entry is the map expression: it extracts the current feature's value, using `coalesce` to default to 0 if missing.
 *
 * This ensures proper counting per type even when some features don't define the property.
 *
 * See: https://docs.mapbox.com/mapbox-gl-js/style-spec/expressions/#accumulated
 */
const createClusterProperties = (types: (string | undefined)[]) =>
  Object.fromEntries(
    types?.map((type) => [
      type,
      [
        ['+', ['accumulated'], ['coalesce', ['get', type], 0]],
        ['coalesce', ['get', type], 0]
      ]
    ]) ?? []
  );

export const useMapFeatureConfig = (locations: MapMarker[]) => {
  const types = locations?.map((location) => location.iconName || MAP.DEFAULT_PIN) || [];
  const uniqueTypes = [...new Set(types)];
  const { data, loading } = useMapSettings();
  const clusterFallbackColor = data?.clusterFallbackColor;
  const clusterMaxZoom = data?.clusterMaxZoom;
  const clusterSuperiorColor = data?.clusterSuperiorColor;
  const layerStyles = data?.layerStyles;
  const markerImages = data?.markerImages;
  const zoomLevel = data?.zoomLevel;

  return {
    clusterCircleColor: createCircleColorExpression(
      uniqueTypes,
      markerImages,
      clusterSuperiorColor,
      clusterFallbackColor
    ),
    clusterMaxZoom,
    clusterProperties: createClusterProperties(uniqueTypes),
    layerStyles,
    loading,
    markerImages,
    zoomLevel
  };
};
