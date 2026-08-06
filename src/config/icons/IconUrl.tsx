import React, { ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { SvgCss } from 'react-native-svg/css';

import { useTheme } from '../../hooks/useTheme';
import { SettingsContext } from '../../SettingsProvider';
import { normalize } from '../normalize';

import { Icon, IconProps, getHitSlops } from './Icon';

const REMOTE_ICON_TIMEOUT_MS = 10000;
const BLACK_SVG_COLOR = String.raw`(?:(?:#000(?:000)?)\b|black\b|rgb\(\s*0\s*,\s*0\s*,\s*0\s*\))`;
const BLACK_SVG_FILL_PATTERN = new RegExp(
  String.raw`(fill\s*(?:=\s*["']|:\s*))${BLACK_SVG_COLOR}`,
  'gi'
);
const BLACK_SVG_STROKE_PATTERN = new RegExp(
  String.raw`(stroke\s*(?:=\s*["']|:\s*))${BLACK_SVG_COLOR}`,
  'gi'
);

type SvgLoadState = {
  status: 'error' | 'loading' | 'success';
  svg: string;
  uri?: string;
};

export const colorizeSvg = (svg: string, fillColor: string, strokeColor = fillColor) =>
  svg
    .replace(BLACK_SVG_FILL_PATTERN, (_match, prefix) => `${prefix}${fillColor}`)
    .replace(BLACK_SVG_STROKE_PATTERN, (_match, prefix) => `${prefix}${strokeColor}`);

const getIconUri = (iconName: string, svgFolderUrl?: string) => {
  if (!iconName) return;
  if (/^https?:\/\//i.test(iconName)) return iconName;

  return svgFolderUrl ? `${svgFolderUrl}/${iconName}.svg` : undefined;
};

export const IconUrl = ({
  accessibilityLabel,
  color: colorProp,
  fallback: fallbackProp,
  fillColor: fillColorProp,
  iconName,
  iconStyle,
  size = normalize(24),
  strokeColor: strokeColorProp,
  style
}: IconProps & { fallback?: ReactNode; iconName: string }) => {
  const { colors } = useTheme();
  const color = colorProp || colors.primary;
  const fillColor = fillColorProp ?? color;
  const strokeColor = strokeColorProp ?? color;
  const { globalSettings } = useContext(SettingsContext);
  const { settings = {} } = globalSettings;
  const { icons = {} } = settings;
  const { svgFolderUrl } = icons;

  const uri = getIconUri(iconName, svgFolderUrl);

  const [loadState, setLoadState] = useState<SvgLoadState>(() => ({
    status: uri ? 'loading' : 'error',
    svg: '',
    uri
  }));

  useEffect(() => {
    if (!uri) {
      setLoadState({ status: 'error', svg: '', uri });
      return;
    }

    let isActive = true;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();

      if (isActive) setLoadState({ status: 'error', svg: '', uri });
    }, REMOTE_ICON_TIMEOUT_MS);

    setLoadState({ status: 'loading', svg: '', uri });

    const fetchSvg = async () => {
      try {
        const response = await fetch(uri, { signal: controller.signal });

        if (!response.ok) throw new Error(`SVG request failed with status ${response.status}`);

        const responseText = await response.text();

        if (!/<svg(?:\s|>)/i.test(responseText)) {
          throw new Error('The remote icon response does not contain SVG markup');
        }

        if (isActive) setLoadState({ status: 'success', svg: responseText, uri });
      } catch (error) {
        if (controller.signal.aborted) return;

        console.error(`Error fetching SVG icon from ${uri}:`, error);

        if (isActive) setLoadState({ status: 'error', svg: '', uri });
      } finally {
        clearTimeout(timeoutId);
      }
    };

    fetchSvg();

    return () => {
      isActive = false;
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [uri]);

  const colorizedSvg = useMemo(
    () => colorizeSvg(loadState.svg, fillColor, strokeColor),
    [fillColor, loadState.svg, strokeColor]
  );
  const isSvgWithStyle = /<style(?:\s|>)/i.test(colorizedSvg);
  const fallback =
    fallbackProp === undefined ? (
      <Icon.NamedIcon color={strokeColor} hasNoHitSlop name="photo-off" size={size} />
    ) : (
      fallbackProp
    );

  if (loadState.uri !== uri || loadState.status === 'loading') return null;

  if (loadState.status === 'error') {
    return (
      <View accessibilityLabel={accessibilityLabel} style={style} hitSlop={getHitSlops(size)}>
        {fallback}
      </View>
    );
  }

  return (
    <View accessibilityLabel={accessibilityLabel} style={style} hitSlop={getHitSlops(size)}>
      {isSvgWithStyle ? (
        <SvgCss color={color} xml={colorizedSvg} height={size} style={iconStyle} width={size} />
      ) : (
        <SvgXml color={color} xml={colorizedSvg} height={size} style={iconStyle} width={size} />
      )}
    </View>
  );
};
