import { Marquee } from '@animatereactnative/marquee';
import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';

import { useHomeRefresh, useStaticContent } from '../hooks';

import { HtmlView } from './HtmlView';

type Props = {
  publicJsonFile: string;
};

interface DataItem {
  liveTickerSettings: {
    direction?: 'horizontal' | 'vertical';
    reverse?: boolean;
    spacing?: number;
    speed?: number;
    style?: ViewStyle;
  };
  text: string;
}

// eslint-disable-next-line complexity
export const LiveTicker = ({ publicJsonFile }: Props) => {
  const { data, refetch } = useStaticContent<DataItem>({
    refreshTimeKey: `publicJsonFile-${publicJsonFile}`,
    name: publicJsonFile,
    type: 'json'
  });

  useHomeRefresh(refetch);

  if (!data) return null;

  const {
    liveTickerSettings: {
      direction = 'horizontal',
      reverse = false,
      spacing = 20,
      speed = 1,
      style
    },
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
      <HtmlView html={text} />
    </Marquee>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden'
  }
});
