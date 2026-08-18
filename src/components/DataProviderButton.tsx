import { useNavigation } from 'expo-router/react-navigation';
import { StackNavigationProp } from 'expo-router/js-stack';
import React, { useCallback } from 'react';

import { texts } from '../config';
import { ScreenName } from '../types';

import { Button } from './Button';
import { Wrapper } from './Wrapper';

type Props = {
  dataProvider: {
    name: string;
    logo?: { url?: string };
  };
};

export const DataProviderButton = ({ dataProvider }: Props) => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const navigateToDataProvider = useCallback(
    () =>
      navigation.push(ScreenName.DataProvider, {
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
