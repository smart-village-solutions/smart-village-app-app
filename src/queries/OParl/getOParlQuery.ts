import { OParlObjectType } from '../../types';
import { agendaItemQuery } from './agendaItem';
import { bodyQuery } from './body';
import { consultationQuery } from './consultation';
import { fileQuery } from './file';
import { legislativeTermQuery } from './legislativeTerm';
import { locationQuery } from './location';
import { meetingQuery } from './meeting';
import { membershipQuery } from './membership';
import { organizationQuery } from './organization';
import { paperQuery } from './paper';
import { personQuery } from './person';

// eslint-disable-next-line complexity
export const getOParlQuery = (type: OParlObjectType) => {
  switch (type) {
    case OParlObjectType.AgendaItem:
    case OParlObjectType.AgendaItem1:
      return agendaItemQuery;
    case OParlObjectType.Body:
    case OParlObjectType.Body1:
      return bodyQuery;
    case OParlObjectType.Consultation:
    case OParlObjectType.Consultation1:
      return consultationQuery;
    case OParlObjectType.File:
    case OParlObjectType.File1:
      return fileQuery;
    case OParlObjectType.LegislativeTerm:
    case OParlObjectType.LegislativeTerm1:
      return legislativeTermQuery;
    case OParlObjectType.Location:
    case OParlObjectType.Location1:
      return locationQuery;
    case OParlObjectType.Meeting:
    case OParlObjectType.Meeting1:
      return meetingQuery;
    case OParlObjectType.Membership:
    case OParlObjectType.Membership1:
      return membershipQuery;
    case OParlObjectType.Organization:
    case OParlObjectType.Organization1:
      return organizationQuery;
    case OParlObjectType.Paper:
    case OParlObjectType.Paper1:
      return paperQuery;
    case OParlObjectType.Person:
    case OParlObjectType.Person1:
      return personQuery;
  }
};
