import React, { memo, useEffect, useState } from 'react';
import { G, Rect, SvgXml } from 'react-native-svg';

import { colors, texts } from '../../config';

import { FloorPlanFloorConfig } from './types';

type Props = {
  config: FloorPlanFloorConfig;
  onError?: (message: string) => void;
};

export const SvgFloorPlan = memo(({ config, onError }: Props) => {
  const [remoteSvg, setRemoteSvg] = useState<string>();
  const [isRemoteError, setIsRemoteError] = useState(false);
  const { svgAsset: SvgAsset, svgUrl, svgXml, viewBox } = config;

  useEffect(() => {
    let isMounted = true;

    const loadRemoteSvg = async () => {
      if (!svgUrl || svgXml || SvgAsset) return;

      try {
        setIsRemoteError(false);
        const response = await fetch(svgUrl);

        if (!response.ok) {
          throw new Error(texts.floorPlan.svgError);
        }

        const svg = await response.text();

        if (isMounted) {
          setRemoteSvg(svg);
        }
      } catch (error) {
        if (isMounted) {
          setIsRemoteError(true);
          onError?.(error instanceof Error ? error.message : texts.floorPlan.svgError);
        }
      }
    };

    loadRemoteSvg();

    return () => {
      isMounted = false;
    };
  }, [SvgAsset, onError, svgUrl, svgXml]);

  if (SvgAsset) {
    return (
      <G>
        <SvgAsset width={viewBox.width} height={viewBox.height} />
      </G>
    );
  }

  const svg = svgXml || remoteSvg;

  if (svg && !isRemoteError) {
    return (
      <SvgXml xml={svg} x={viewBox.x} y={viewBox.y} width={viewBox.width} height={viewBox.height} />
    );
  }

  return (
    <G>
      <Rect
        x={viewBox.x}
        y={viewBox.y}
        width={viewBox.width}
        height={viewBox.height}
        fill={colors.backgroundRgba}
      />
    </G>
  );
});

SvgFloorPlan.displayName = 'SvgFloorPlan';
