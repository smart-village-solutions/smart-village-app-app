import React, { useCallback } from 'react';
import { NavigationScreenProp } from 'react-navigation';

import { texts } from '../config';
import { Button } from './Button';
import { Wrapper } from './Wrapper';

type Props = {
  dataProvider: {
    name: string;
    logo?: { url?: string };
  };
  navigation: NavigationScreenProp<never>;
};

export const DataProviderButton = ({ dataProvider, navigation }: Props) => {
  const navigateToDataProvider = useCallback(
    () =>
      navigation.push('DataProvider', {
        dataProviderName: dataProvider.name,
        logo: dataProvider?.logo?.url,
        title: dataProvider.name
      }),

    [dataProvider, navigation]
  );

  return (
    <Wrapper>
      <Button
        title={`${texts.dataProvider.more} ${dataProvider.name}`}
        onPress={navigateToDataProvider}
      />
    </Wrapper>
  );
};
