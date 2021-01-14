import React from 'react';
import { ScrollView } from 'react-native';
import { NavigationScreenProp } from 'react-navigation';

import { HeaderLeft, SafeAreaViewFlex } from '../components';
import { File, LegislativeTerm } from '../components/oParl';
import { FileData, OParlObjectData, OParlObjectType } from '../types';

type Props = {
  navigation: NavigationScreenProp<never>;
};

const startDate = new Date();
startDate.setFullYear(2022);

const endDate = new Date();
endDate.setFullYear(2048);

//---------------------------- DUMMY DATA -------------------------------------

// const data: OParlObjectData = {
//   type: OParlObjectType.LegislativeTerm,
//   body: { id: 'asd', name: 'LookAtMyBody' },
//   endDate,
//   startDate,
//   keyword: ['moon', 'emoji'],
//   name: 'The force will be with you. Always.',
//   web: 'https://github.com/digorath'
// };

const moreDummyFileData: ({ id: string } & FileData)[] = [];
const data: { id: string } & FileData = {
  id: 'asd',
  accessUrl: 'accsessURL',
  type: OParlObjectType.File,
  date: new Date(),
  derivativeFile: moreDummyFileData,
  size: 12345678,
  // name: 'NAme',
  fileName: 'filename',
  mimeType: 'pdf'
};

moreDummyFileData.push(data);
moreDummyFileData.push(data);
moreDummyFileData.push(data);
moreDummyFileData.push(data);

//------------------------ END OF DUMMY DATA ----------------------------------

const getComponent = (data: OParlObjectData, navigation: NavigationScreenProp<never>) => {
  switch (data.type) {
    case OParlObjectType.LegislativeTerm:
      return <LegislativeTerm data={data} navigation={navigation} />;
    case OParlObjectType.File:
      return <File data={data} navigation={navigation} />;
    default:
      // TODO: Add sensible fallback
      return null;
  }
};

export const OParlDetailScreen = ({ navigation }: Props) => {
  // const oparlType = navigation.getParam('OParlType');
  // const id = navigation.getParam('id');

  // const { data } = useQuery(getoparlquerywithparamsandstuff)

  return (
    <SafeAreaViewFlex>
      <ScrollView>{getComponent(data, navigation)}</ScrollView>
    </SafeAreaViewFlex>
  );
};

OParlDetailScreen.navigationOptions = ({ navigation }: Props) => {
  return {
    headerLeft: <HeaderLeft navigation={navigation} />
  };
};
