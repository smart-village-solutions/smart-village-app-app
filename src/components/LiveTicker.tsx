import { Marquee } from '@animatereactnative/marquee';
import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';

import { device } from '../config';
import { useHomeRefresh, useStaticContent } from '../hooks';

import { HtmlView } from './HtmlView';

type Props = {
  publicJsonFile: string;
};

type DataItem = {
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
  const { data, refetch } = useStaticContent<DataItem>({
    refreshTimeKey: `publicJsonFile-${publicJsonFile}`,
    name: publicJsonFile,
    type: 'json'
  });

  useHomeRefresh(refetch);

  if (!data?.text?.length) return null;

  const {
    liveTickerSettings: { direction = '', reverse = false, spacing = 20, speed = 1, style },
    text
  } = data;

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
