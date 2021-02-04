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
    case OParlObjectType.AgendaItem1:
      return <AgendaItem data={data} navigation={navigation} />;
    case OParlObjectType.Body:
    case OParlObjectType.Body1:
      return <Body data={data} navigation={navigation} />;
    case OParlObjectType.Consultation:
    case OParlObjectType.Consultation1:
      return <Consultation data={data} navigation={navigation} />;
    case OParlObjectType.File:
    case OParlObjectType.File1:
      return <File data={data} navigation={navigation} />;
    case OParlObjectType.LegislativeTerm:
    case OParlObjectType.LegislativeTerm1:
      return <LegislativeTerm data={data} navigation={navigation} />;
    case OParlObjectType.Location:
    case OParlObjectType.Location1:
      return <Location data={data} navigation={navigation} />;
    case OParlObjectType.Meeting:
    case OParlObjectType.Meeting1:
      return <Meeting data={data} navigation={navigation} />;
    case OParlObjectType.Membership:
    case OParlObjectType.Membership1:
      return <Membership data={data} navigation={navigation} />;
    case OParlObjectType.Organization:
    case OParlObjectType.Organization1:
      return <Organization data={data} navigation={navigation} />;
    case OParlObjectType.Paper:
    case OParlObjectType.Paper1:
      return <Paper data={data} navigation={navigation} />;
    case OParlObjectType.Person:
    case OParlObjectType.Person1:
      return <Person data={data} navigation={navigation} />;
    case OParlObjectType.System:
    case OParlObjectType.System1:
      return <System data={data} navigation={navigation} />;
    // TODO: add sensible fallback
    default:
      return null;
  }
};
