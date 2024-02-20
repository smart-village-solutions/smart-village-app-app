import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { SvgCssUri, SvgUri } from 'react-native-svg';

import { IconProps, colors, getHitSlops, normalize } from '../config';

export const IconUrl = ({
  color = colors.primary,
  iconName,
  iconStyle,
  size = normalize(24),
  style,
  url
}: IconProps & { iconName: string }) => {
  const [svgContent, setSvgContent] = useState('');

  useEffect(() => {
    const fetchSVG = async () => {
      try {
        const response = await fetch(
          url || `https://fileserver.smart-village.app/hb-meinquartier/tabler-icons/${iconName}.svg`
        );
        const svgText = await response.text();

        setSvgContent(svgText);
      } catch (error) {
        console.error('Error fetching SVG:', error);
      }
    };

    fetchSVG();
  }, [url]);

  if (!svgContent || svgContent.match(/Error/) || (!url && !iconName)) return null;

  const colorizedSvg = svgContent.replace(/stroke:#000000/g, `stroke:${color}`);

  if (svgContent.match(/style/)) {
    return (
      <View style={style} hitSlop={getHitSlops(size)}>
        <SvgCssUri
          color={color}
          height={size}
          style={iconStyle}
          uri={`data:image/svg+xml,${encodeURIComponent(colorizedSvg)}`}
          width={size}
        />
      </View>
    );
  }

  return (
    <View style={style} hitSlop={getHitSlops(size)}>
      <SvgUri
        color={color}
        height={size}
        style={iconStyle}
        uri={`data:image/svg+xml,${encodeURIComponent(colorizedSvg)}`}
        width={size}
      />
    </View>
  );
};
