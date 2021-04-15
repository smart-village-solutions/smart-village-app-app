import { OParlObjectType } from '../../types';
import { agendaItemQuery } from './agendaItem';
import { consultationQuery } from './consultation';
import { meetingQuery } from './meeting';
import { organizationQuery } from './organization';
import { paperQuery } from './paper';
import { personQuery } from './person';

// eslint-disable-next-line complexity
export const getOParlQuery = (type: OParlObjectType) => {
  switch (type) {
    case OParlObjectType.AgendaItem:
    case OParlObjectType.AgendaItem1:
      return agendaItemQuery;
    case OParlObjectType.Consultation:
    case OParlObjectType.Consultation1:
      return consultationQuery;
    case OParlObjectType.Meeting:
    case OParlObjectType.Meeting1:
      return meetingQuery;
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
