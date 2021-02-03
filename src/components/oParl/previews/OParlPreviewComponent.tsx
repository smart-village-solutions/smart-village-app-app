import React from 'react';
import { NavigationScreenProp } from 'react-navigation';

import { OParlObjectPreviewData, OParlObjectType } from '../../../types';
import { AgendaItemPreview } from './AgendaItemPreview';
import { BodyPreview } from './BodyPreview';
import { ConsultationPreview } from './ConsultationPreview';
import { FilePreview } from './FilePreview';
import { LegislativeTermPreview } from './LegislativeTermPreview';
import { LocationPreview } from './LocationPreview';
import { MeetingPreview } from './MeetingPreview';
import { MembershipPreview } from './MembershipPreview';
import { OrganizationPreview } from './OrganizationPreview';
import { PaperPreview } from './PaperPreview';
import { PersonPreview } from './PersonPreview';
import { SystemPreview } from './SystemPreview';

type PreviewProps = {
  additionalProps?: {
    withAgendaItem?: boolean;
    withNumberAndTime?: boolean;
    withPerson?: boolean;
  };
  data: OParlObjectPreviewData;
  navigation: NavigationScreenProp<never>;
};

// eslint-disable-next-line complexity
export const OParlPreviewComponent = ({ additionalProps, data, navigation }: PreviewProps) => {
  switch (data.type) {
    case OParlObjectType.AgendaItem:
      return (
        <AgendaItemPreview
          data={data}
          navigation={navigation}
          withNumberAndTime={additionalProps?.withNumberAndTime}
        />
      );
    case OParlObjectType.Body:
      return <BodyPreview data={data} navigation={navigation} />;
    case OParlObjectType.Consultation:
      return (
        <ConsultationPreview
          data={data}
          navigation={navigation}
          withAgendaItem={additionalProps?.withAgendaItem}
        />
      );
    case OParlObjectType.File:
      return <FilePreview data={data} navigation={navigation} />;
    case OParlObjectType.LegislativeTerm:
      return <LegislativeTermPreview data={data} navigation={navigation} />;
    case OParlObjectType.Location:
      return <LocationPreview data={data} navigation={navigation} />;
    case OParlObjectType.Meeting:
      return <MeetingPreview data={data} navigation={navigation} />;
    case OParlObjectType.Membership:
      return (
        <MembershipPreview
          data={data}
          navigation={navigation}
          withPerson={additionalProps?.withPerson}
        />
      );
    case OParlObjectType.Organization:
      return <OrganizationPreview data={data} navigation={navigation} />;
    case OParlObjectType.Paper:
      return <PaperPreview data={data} navigation={navigation} />;
    case OParlObjectType.Person:
      return <PersonPreview data={data} navigation={navigation} />;
    case OParlObjectType.System:
      return <SystemPreview data={data} navigation={navigation} />;
    default:
      return null;
  }
};
