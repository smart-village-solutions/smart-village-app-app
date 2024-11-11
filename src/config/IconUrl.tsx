import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { SvgUri } from 'react-native-svg';
import { SvgCss } from 'react-native-svg/css';

import { IconProps, colors, getHitSlops, normalize } from '../config';

export const IconUrl = ({
  color = colors.primary,
  iconName,
  iconStyle,
  size = normalize(24),
  style
}: IconProps & { iconName: string }) => {
  // if we can use `SvgUri`, we can render the svg directly per passing an uri
  const uri = iconName
    ? iconName.match(/http/)
      ? iconName
      : `https://fileserver.smart-village.app/hb-meinquartier/tabler-icons/${iconName}.svg`
    : undefined;

  // if we need to use `SvgCssUri`, we need to fetch the svg first to apply its content
  const [isLoading, setIsLoading] = useState(true);
  const [svg, setSvg] = useState('');
  const [isSvgWithStyle, setIsSvgWithStyle] = useState(false);

  useEffect(() => {
    // we always need to read the svg first, to see if it contains a style tag
    const fetchSvg = async () => {
      if (!uri) return;

      try {
        const response = await fetch(uri);
        const responseText = await response.text();

        setIsSvgWithStyle(!!responseText.match(/style/));
        setSvg(responseText);
      } catch (error) {
        console.error('Error fetching SVG:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSvg();
  }, [uri]);

  if (isLoading || svg?.match(/Error/)) return null;

  if (isSvgWithStyle) {
    const colorizedSvg = svg.replace(/stroke:#000000/g, `stroke:${color}`);

    return (
      <View style={style} hitSlop={getHitSlops(size)}>
        <SvgCss xml={colorizedSvg} height={size} style={iconStyle} width={size} />
      </View>
    );
  }

  return (
    <View style={style} hitSlop={getHitSlops(size)}>
      <SvgUri color={color} height={size} style={iconStyle} uri={uri} width={size} />
    </View>
  );
};
