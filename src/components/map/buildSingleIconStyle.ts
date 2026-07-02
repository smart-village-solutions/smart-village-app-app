type LabelStyles = {
  labelColor?: string;
  labelSize?: number;
};

type SingleIconStyle = {
  iconAnchor?: string;
  iconSize?: number;
};

export const buildSingleIconStyle = ({
  labelStyles,
  markerLabelHaloColor,
  ownLocationPin,
  selectedMarker,
  showMarkerLabels,
  singleIconStyle
}: {
  labelStyles?: LabelStyles;
  markerLabelHaloColor?: unknown;
  ownLocationPin: string;
  selectedMarker?: string;
  showMarkerLabels: boolean;
  singleIconStyle?: SingleIconStyle;
}) => ({
  ...singleIconStyle,
  iconImage: [
    'case',
    ['==', ['get', 'id'], selectedMarker],
    ['coalesce', ['get', 'activeIconName'], ['get', 'iconName']],
    ['get', 'iconName']
  ],
  iconSize: [
    'case',
    ['==', ['get', 'id'], selectedMarker],
    (singleIconStyle?.iconSize ?? 1) * 1.2,
    singleIconStyle?.iconSize
  ],
  iconAnchor: [
    'case',
    ['==', ['get', 'iconName'], ownLocationPin],
    'center',
    singleIconStyle?.iconAnchor
  ],
  iconAllowOverlap: true,
  iconIgnorePlacement: true,
  ...(showMarkerLabels && {
    textField: ['get', 'label'],
    textFont: ['Noto Sans Bold', 'Open Sans Bold'],
    textSize: labelStyles?.labelSize ?? 12,
    textColor: labelStyles?.labelColor ?? '#ffffff',
    textOffset: [0, -2.0],
    textAnchor: 'center',
    textAllowOverlap: true,
    textIgnorePlacement: true,
    ...(markerLabelHaloColor && {
      textHaloColor: markerLabelHaloColor,
      textHaloWidth: 7
    })
  })
});
