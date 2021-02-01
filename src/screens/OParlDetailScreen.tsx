import React from 'react';
import { ScrollView, View } from 'react-native';
import { NavigationScreenProp } from 'react-navigation';

import { HeaderLeft, SafeAreaViewFlex, WrapperWithOrientation } from '../components';
import {
  AgendaItem,
  Body,
  Consultation,
  File,
  LegislativeTerm,
  Location,
  Meeting,
  Membership,
  Organization,
  Paper,
  Person,
  System
} from '../components/oParl';
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

// eslint-disable-next-line complexity
const getComponent = (data: OParlObjectData, navigation: NavigationScreenProp<never>) => {
  switch (data.type) {
    case OParlObjectType.AgendaItem:
      return <AgendaItem data={data} navigation={navigation} />;
    case OParlObjectType.Body:
      return <Body data={data} navigation={navigation} />;
    case OParlObjectType.Consultation:
      return <Consultation data={data} navigation={navigation} />;
    case OParlObjectType.File:
      return <File data={data} navigation={navigation} />;
    case OParlObjectType.LegislativeTerm:
      return <LegislativeTerm data={data} navigation={navigation} />;
    case OParlObjectType.Location:
      return <Location data={data} navigation={navigation} />;
    case OParlObjectType.Meeting:
      return <Meeting data={data} navigation={navigation} />;
    case OParlObjectType.Membership:
      return <Membership data={data} navigation={navigation} />;
    case OParlObjectType.Organization:
      return <Organization data={data} navigation={navigation} />;
    case OParlObjectType.Paper:
      return <Paper data={data} navigation={navigation} />;
    case OParlObjectType.Person:
      return <Person data={data} navigation={navigation} />;
    case OParlObjectType.System:
      return <System data={data} navigation={navigation} />;
    default:
      // TODO: Add sensible fallback
      return <View />;
  }
};

export const OParlDetailScreen = ({ navigation }: Props) => {
  // const oparlType = navigation.getParam('OParlType');
  // const id = navigation.getParam('id');

  // const { data } = useQuery(getoparlquerywithparamsandstuff)

  return (
    <SafeAreaViewFlex>
      <ScrollView>
        <WrapperWithOrientation>{getComponent(data, navigation)}</WrapperWithOrientation>
      </ScrollView>
    </SafeAreaViewFlex>
  );
};

OParlDetailScreen.navigationOptions = ({ navigation }: Props) => {
  return {
    headerLeft: <HeaderLeft navigation={navigation} />
  };
};
