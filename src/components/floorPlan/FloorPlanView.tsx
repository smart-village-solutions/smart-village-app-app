import React, { memo, useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { RegularText } from '../Text';
import { colors, normalize, texts } from '../../config';

import { FloorPlanPinLayer } from './FloorPlanPinLayer';
import { FloorPlanFloorSwitcher } from './FloorPlanFloorSwitcher';
import { FloorPlanResetButton } from './FloorPlanResetButton';
import { SvgFloorPlan } from './SvgFloorPlan';
import { FloorPlanFloorConfig, FloorPlanPin } from './types';
import { useZoomableSvgTransform } from './useZoomableSvgTransform';
import { getValidFloorPlanPins } from './utils';
import { ZoomableSvgContainer } from './ZoomableSvgContainer';

type Props = {
  config: FloorPlanFloorConfig;
  floors: FloorPlanFloorConfig[];
  onPinPress: (pin: FloorPlanPin) => void;
  onFloorSelect: (floorId: string) => void;
  selectedPinId?: string;
};

export const FloorPlanView = memo(
  ({ config, floors, onFloorSelect, onPinPress, selectedPinId }: Props) => {
    const { animatedStyle, gesture, reset } = useZoomableSvgTransform();
    const [svgError, setSvgError] = useState<string>();
    const validPins = useMemo(
      () => getValidFloorPlanPins(config.pins, config.viewBox),
      [config.pins, config.viewBox]
    );

    const handleSvgError = useCallback((message: string) => {
      setSvgError(message);
    }, []);

    if (!config.svgAsset && !config.svgUrl && !config.svgXml) {
      return (
        <View style={styles.fallback}>
          <RegularText center placeholder style={styles.fallbackText}>
            {texts.floorPlan.svgFallback}
          </RegularText>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <ZoomableSvgContainer
          animatedStyle={animatedStyle}
          gesture={gesture}
          viewBox={config.viewBox}
        >
          <SvgFloorPlan config={config} onError={handleSvgError} />
          <FloorPlanPinLayer
            pins={validPins}
            selectedPinId={selectedPinId}
            onPinPress={onPinPress}
          />
        </ZoomableSvgContainer>
        <FloorPlanResetButton onPress={reset} />
        <FloorPlanFloorSwitcher
          floors={floors}
          selectedFloorId={config.id}
          onFloorSelect={onFloorSelect}
        />
        {!!svgError && (
          <View style={styles.error}>
            <RegularText smallest error style={styles.errorText}>
              {svgError}
            </RegularText>
          </View>
        )}
      </View>
    );
  }
);

FloorPlanView.displayName = 'FloorPlanView';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: normalize(260)
  },
  error: {
    backgroundColor: colors.errorRgba,
    bottom: normalize(12),
    left: normalize(12),
    padding: normalize(8),
    position: 'absolute',
    right: normalize(12)
  },
  errorText: {
    textAlign: 'center'
  },
  fallback: {
    alignItems: 'center',
    backgroundColor: colors.backgroundRgba,
    flex: 1,
    justifyContent: 'center',
    minHeight: normalize(260),
    padding: normalize(16)
  },
  fallbackText: {
    textAlign: 'center'
  }
});
