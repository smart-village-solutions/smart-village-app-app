import React from 'react';
import { ScrollView, View } from 'react-native';
import { NavigationScreenProp } from 'react-navigation';

import { HeaderLeft, RegularText, SafeAreaViewFlex, WrapperWithOrientation } from '../components';
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
import { DummyData } from '../OParlDummyData';
import { OParlObjectData, OParlObjectType } from '../types';

type Props = {
  navigation: NavigationScreenProp<never>;
};

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
  const id = navigation.getParam('id');

  // const { data } = useQuery(getoparlquerywithparamsandstuff)

  const data = DummyData.find((item) => item.id === (id ?? 'S1'));

  // TODO: proper fallback
  if (!data) return <RegularText>Unknown Id</RegularText>;

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
