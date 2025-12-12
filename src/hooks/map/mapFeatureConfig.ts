import { consts } from '../../config';
import { MapMarker } from '../../types';
import { useStaticContent } from '../staticContent';

const { MAP, REFRESH_INTERVALS } = consts;

export const useMapSettings = () => {
  const { data, loading } = useStaticContent({
    name: 'mapSettings',
    refreshInterval: REFRESH_INTERVALS.ONCE_PER_MINUTE,
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
) => {
  const definedTypes = (types ?? []).filter((type): type is string => !!type);
  const colorCases = definedTypes.flatMap((type) => {
    const color = markerImages?.[type]?.color;

    if (!color) return [];

    return [['>', ['coalesce', ['get', type], 0], 1], color];
  });

  return [
    'case',
    [
      '>=',
      [
        '+',
        ...definedTypes.map((type) => ['case', ['>', ['coalesce', ['get', type], 0], 1], 1, 0])
      ],
      2
    ],
    clusterSuperiorColor,
    ...colorCases,
    clusterFallbackColor
  ];
};

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
const createClusterProperties = (types: (string | undefined)[]) => {
  const definedTypes = (types ?? []).filter((type): type is string => !!type);

  return Object.fromEntries(
    definedTypes.map((type) => [
      type,
      [
        ['+', ['accumulated'], ['coalesce', ['get', type], 0]],
        ['coalesce', ['get', type], 0]
      ]
    ])
  );
};

/**
 * Generates a dynamic `textColor` expression for a cluster layer.
 *
 * - If two or more of the defined `types` have values > 1 in a cluster, it uses `clusterSuperiorTextColor`.
 * - Otherwise, it gets the color from `clusterCountTextColor`.
 * - Falls back to `clusterFallbackTextColor` if none match.
 *
 * This leverages Mapbox expression syntax:
 * https://docs.mapbox.com/mapbox-gl-js/style-spec/expressions/
 */
const createTextColorExpression = (
  types: (string | undefined)[],
  clusterSuperiorTextColor: string,
  clusterCountTextColor: string,
  clusterFallbackTextColor: string
) => {
  const definedTypes = (types ?? []).filter((type): type is string => !!type);
  const textColorCases = definedTypes.flatMap((type) => [
    ['>', ['coalesce', ['get', type], 0], 1],
    clusterCountTextColor
  ]);

  return [
    'case',
    [
      '>=',
      [
        '+',
        ...definedTypes.map((type) => ['case', ['>', ['coalesce', ['get', type], 0], 1], 1, 0])
      ],
      2
    ],
    clusterSuperiorTextColor,
    ...textColorCases,
    clusterFallbackTextColor
  ];
};

export const useMapFeatureConfig = (locations: MapMarker[]) => {
  const types = locations?.map((location) => location.iconName || MAP.DEFAULT_PIN) || [];
  const uniqueTypes = [...new Set(types)];
  const { data, loading } = useMapSettings();
  const clusterFallbackColor = data?.clusterFallbackColor;
  const clusterFallbackTextColor = data?.clusterFallbackTextColor;
  const clusterRadius = data?.clusterRadius;
  const clusterMaxZoom = data?.clusterMaxZoom;
  const clusterMinPoints = data?.clusterMinPoints;
  const clusterSuperiorColor = data?.clusterSuperiorColor;
  const clusterSuperiorTextColor = data?.clusterSuperiorTextColor;
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
    clusterRadius,
    clusterMaxZoom,
    clusterMinPoints,
    clusterProperties: createClusterProperties(uniqueTypes),
    clusterTextColor: createTextColorExpression(
      uniqueTypes,
      clusterSuperiorTextColor,
      layerStyles?.clusterCount?.textColor,
      clusterFallbackTextColor
    ),
    layerStyles,
    loading,
    markerImages,
    zoomLevel
  };
};
