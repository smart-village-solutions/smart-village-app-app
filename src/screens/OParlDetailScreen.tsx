import React from 'react';
import { ScrollView } from 'react-native';
import { NavigationScreenProp } from 'react-navigation';

import { HeaderLeft, RegularText, SafeAreaViewFlex, WrapperWithOrientation } from '../components';
import { OParlComponent } from '../components/oParl';
import { DummyData } from '../OParlDummyData';

type Props = {
  navigation: NavigationScreenProp<never>;
};

export const OParlDetailScreen = ({ navigation }: Props) => {
  // const oparlType = navigation.getParam('OParlType');
  const id = navigation.getParam('id');

  // const { data } = useQuery(getoparlquerywithparamsandstuff)

  const data = DummyData.find((item) => item.id === (id ?? 'S1'));

  // TODO: proper fallback
  if (!data) return <RegularText>Unknown Id</RegularText>;

  return (
    <SafeAreaViewFlex>
      <ScrollView>
        <WrapperWithOrientation>
          <OParlComponent data={data} navigation={navigation} />
        </WrapperWithOrientation>
      </ScrollView>
    </SafeAreaViewFlex>
  );
};

OParlDetailScreen.navigationOptions = ({ navigation }: Props) => {
  return {
    headerLeft: <HeaderLeft navigation={navigation} />
  };
};
