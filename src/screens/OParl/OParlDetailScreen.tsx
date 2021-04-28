import React, { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import { NavigationScreenProp } from 'react-navigation';

import {
  HeaderLeft,
  RegularText,
  SafeAreaViewFlex,
  WrapperWithOrientation
} from '../../components';
import { OParlComponent } from '../../components/oParl';
import { executeOParlQuery } from '../../OParlProvider';
import { getOParlQuery } from '../../queries/OParl';
import { OParlObjectData } from '../../types';

type Props = {
  navigation: NavigationScreenProp<never>;
};

export const OParlDetailScreen = ({ navigation }: Props) => {
  const oParlType = navigation.getParam('type');
  const id = navigation.getParam('id');

  const [oParlItem, setOParlItem] = useState<OParlObjectData[]>();

  useEffect(() => {
    const query = getOParlQuery(oParlType);
    query && executeOParlQuery(query, setOParlItem, { id });
  }, [id, oParlType, setOParlItem]);

  const data = oParlItem?.[0];

  console.log({ id, oParlType });

  // TODO: proper fallback
  if (!data)
    return (
      <>
        <RegularText>Type: {oParlType} </RegularText>
        <RegularText>Id: {id}</RegularText>
      </>
    );

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
