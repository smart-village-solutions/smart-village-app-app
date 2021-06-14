import React, { useCallback, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Collapsible from 'react-native-collapsible';

import { SectionHeader } from './SectionHeader';
import { BoldText } from './Text';
import { Wrapper } from './Wrapper';

type Props<T> = {
  data?: T[];
  header?: JSX.Element | string;
  limit?: number;
  renderItem: (props: T, key: number) => JSX.Element;
};

export const PreviewSection = <T,>({ data, header, limit = 3, renderItem }: Props<T>) => {
  const [collapsed, setCollapsed] = useState(true);

  const onPress = useCallback(() => setCollapsed((value) => !value), [setCollapsed]);

  if (!data?.length) {
    return null;
  }

  return (
    <>
      {typeof header === 'string' ? <SectionHeader title={header} /> : header}
      {data.slice(0, limit).map(renderItem)}
      {data.length > limit && (
        <>
          <Collapsible collapsed={collapsed}>
            {data.slice(limit, data.length).map(renderItem)}
          </Collapsible>
          <Wrapper>
            <TouchableOpacity onPress={onPress} style={styles.touchable}>
              <BoldText primary small>
                {collapsed ? 'Alle anzeigen' : 'Weniger anzeigen'}
              </BoldText>
            </TouchableOpacity>
          </Wrapper>
        </>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  touchable: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center'
  }
});
