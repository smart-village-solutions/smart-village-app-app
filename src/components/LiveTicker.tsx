import { Marquee } from '@animatereactnative/marquee';
import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';

import { device } from '../config';
import { resolveThemeOverrides } from '../helpers/appDesignSystemHelper';
import { useHomeRefresh, useStaticContent } from '../hooks';
import { useTheme } from '../hooks/useTheme';

import { HtmlView } from './HtmlView';

type Props = {
  publicJsonFile: string;
};

type DataItem = {
  dark?: Partial<DataItem>;
  liveTickerSettings: {
    direction?: 'horizontal' | 'vertical';
    reverse?: boolean;
    spacing?: number;
    speed?: number;
    style?: ViewStyle | ViewStyle[];
  };
  text: string;
};

export const LiveTicker = ({ publicJsonFile }: Props) => {
  const { mode } = useTheme();
  const { data, refetch } = useStaticContent<DataItem>({
    refreshTimeKey: `publicJsonFile-${publicJsonFile}`,
    name: publicJsonFile,
    type: 'json'
  });

  useHomeRefresh(refetch);

  const themedData = resolveThemeOverrides(data, mode);

  if (!themedData?.text?.length) return null;

  const {
    liveTickerSettings: { direction = '', reverse = false, spacing = 20, speed = 1, style },
    text
  } = themedData;

  return (
    <Marquee
      direction={direction}
      reverse={reverse}
      spacing={spacing}
      speed={speed}
      style={[styles.container, style]}
    >
      <HtmlView html={`<div style="padding-left: ${device.width / 2}px">${text}</div>`} />
    </Marquee>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden'
  }
});
