import React, { useCallback, useState } from 'react';
import Collapsible from 'react-native-collapsible';

import { Button } from './Button';
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
      {typeof header === 'string' ? <BoldText>{header}</BoldText> : header}
      {data.slice(0, limit).map(renderItem)}
      {data.length > limit && (
        <>
          {}
          <Collapsible collapsed={collapsed}>
            {data.slice(limit, data.length).map(renderItem)}
          </Collapsible>
          <Wrapper>
            <Button title={collapsed ? 'Alle anzeigen' : 'Weniger anzeigen'} onPress={onPress} />
          </Wrapper>
        </>
      )}
    </>
  );
};
