import { useNavigation } from '@react-navigation/native';
import React, { useContext } from 'react';
import { View } from 'react-native';

import { texts } from '../config';
import { useHomeRefresh, useStaticContent } from '../hooks';
import { SettingsContext } from '../SettingsProvider';
import { ScreenName } from '../types';

import { Button } from './Button';
import { SectionHeader } from './SectionHeader';
import { Wrapper } from './Wrapper';

type TButton = {
  params?: any;
  routeName: ScreenName;
  title: string;
};

export const HomeButtons = ({ publicJsonFile }: { publicJsonFile: string }) => {
  const navigation = useNavigation();
  const { globalSettings } = useContext(SettingsContext);

  const { data, loading, refetch } = useStaticContent<TButton[]>({
    refreshTimeKey: `publicJsonFile-${publicJsonFile}`,
    name: publicJsonFile,
    type: 'json'
  });

  useHomeRefresh(refetch);

  if (loading || !data?.length) return null;

  const { sections = {} } = globalSettings;
  const { headlineButtons = texts.homeTitles.buttons } = sections;

  return (
    <View>
      <SectionHeader title={headlineButtons} />
      <Wrapper>
        {data?.map((item, index) => (
          <Button
            key={`${item.title}-${index}`}
            onPress={() => navigation.navigate(item.routeName, item.params)}
            title={item.title}
          />
        ))}
      </Wrapper>
    </View>
  );
};
