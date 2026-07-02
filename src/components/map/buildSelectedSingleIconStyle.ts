type LabelStyles = {
  labelColorActive?: string;
  labelSizeActive?: number;
};

type SingleIconStyle = {
  iconAnchor?: string;
  iconSize?: number;
};

export const buildSelectedSingleIconStyle = ({
  labelStyles,
  markerLabelHaloColor,
  ownLocationPin,
  showMarkerLabels,
  singleIconStyle
}: {
  labelStyles?: LabelStyles;
  markerLabelHaloColor?: unknown;
  ownLocationPin: string;
  showMarkerLabels: boolean;
  singleIconStyle?: SingleIconStyle;
}) => ({
  ...singleIconStyle,
  iconImage: ['coalesce', ['get', 'activeIconName'], ['get', 'iconName']],
  iconSize: (singleIconStyle?.iconSize ?? 1) * 1.2,
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
    textSize: labelStyles?.labelSizeActive ?? 14,
    textColor: labelStyles?.labelColorActive ?? '#000000',
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
