import React, { memo, useMemo } from 'react';
import { Circle, G, Text as SvgText } from 'react-native-svg';

import { consts, texts } from '../../config';
import { useTheme } from '../../hooks/useTheme';
import { ThemeColorPalette } from '../../types/Theme';

import { FloorPlanPin, FloorPlanPinType } from './types';

type Props = {
  pins: FloorPlanPin[];
  selectedPinId?: string;
  onPinPress: (pin: FloorPlanPin) => void;
};

const getPinFill = (colors: ThemeColorPalette, type?: string) => {
  const pinFillByType: Record<FloorPlanPinType, string> = {
    info: colors.blue,
    room: colors.primary,
    service: colors.secondary,
    warning: colors.error
  };

  return type && type in pinFillByType
    ? pinFillByType[type as FloorPlanPinType]
    : pinFillByType.info;
};

const Pin = memo(
  ({
    isSelected,
    onPress,
    pin
  }: {
    isSelected: boolean;
    onPress: (pin: FloorPlanPin) => void;
    pin: FloorPlanPin;
  }) => {
    const { colors } = useTheme();
    const fill = getPinFill(colors, pin.type);
    const radius = isSelected ? 32 : 24;
    const accessibilityLabel = `${pin.accessibilityLabel || pin.title}${
      isSelected ? `, ${texts.floorPlan.selected}` : ''
    } ${consts.a11yLabel.button}`;

    return (
      <G
        accessible
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        accessibilityState={{ selected: isSelected }}
        onPress={() => onPress(pin)}
        testID={`floor-plan-pin-${pin.id}`}
      >
        <Circle cx={pin.x} cy={pin.y} r={72} fill={colors.surface} opacity={0.01} />
        <Circle
          cx={pin.x}
          cy={pin.y}
          r={radius}
          fill={fill}
          stroke={isSelected ? colors.darkerPrimary : colors.surface}
          strokeWidth={isSelected ? 10 : 6}
        />
        <Circle cx={pin.x} cy={pin.y} r={8} fill={colors.surface} />
        {!!pin.icon && (
          <SvgText
            x={pin.x}
            y={pin.y + 7}
            fill={colors.surface}
            fontSize="22"
            fontWeight="700"
            textAnchor="middle"
          >
            {pin.icon.slice(0, 2).toUpperCase()}
          </SvgText>
        )}
      </G>
    );
  }
);

Pin.displayName = 'FloorPlanPin';

export const FloorPlanPinLayer = memo(({ pins, selectedPinId, onPinPress }: Props) => {
  const renderedPins = useMemo(
    () =>
      pins.map((pin) => (
        <Pin key={pin.id} pin={pin} isSelected={pin.id === selectedPinId} onPress={onPinPress} />
      )),
    [onPinPress, pins, selectedPinId]
  );

  return <G>{renderedPins}</G>;
});

FloorPlanPinLayer.displayName = 'FloorPlanPinLayer';
