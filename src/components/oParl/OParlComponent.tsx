import React from 'react';
import { NavigationScreenProp } from 'react-navigation';
import { OParlObjectData, OParlObjectType } from '../../types';
import { AgendaItem } from './AgendaItem';
import { Body } from './Body';
import { Consultation } from './Consultation';
import { File } from './File';
import { LegislativeTerm } from './LegislativeTerm';
import { Location } from './Location';
import { Meeting } from './Meeting';
import { Membership } from './Membership';
import { Organization } from './Organization';
import { Paper } from './Paper';
import { Person } from './Person';
import { System } from './System';

type Props = {
  data: OParlObjectData;
  navigation: NavigationScreenProp<never>;
};

// eslint-disable-next-line complexity
export const OParlComponent = ({ data, navigation }: Props) => {
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
    // TODO: add sensible fallback
    default:
      return null;
  }
};
