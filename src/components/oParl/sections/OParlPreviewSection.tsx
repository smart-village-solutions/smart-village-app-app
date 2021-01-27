import React, { useCallback } from 'react';
import { NavigationScreenProp } from 'react-navigation';

import { OParlObjectPreviewData, OParlObjectType } from '../../../types';
import { PreviewSection } from '../../PreviewSection';
import {
  AgendaItemPreview,
  BodyPreview,
  ConsultationPreview,
  FilePreview,
  LegislativeTermPreview,
  LocationPreview,
  MeetingPreview,
  MembershipPreview,
  OrganizationPreview,
  PaperPreview,
  PersonPreview
} from '../previews';
import { SystemPreview } from '../previews/SystemPreview';

type Props = {
  additionalProps?: {
    withAgendaItem?: boolean;
    withNumberAndTime?: boolean;
  };
  data?: OParlObjectPreviewData[];
  header: JSX.Element | string;
  navigation: NavigationScreenProp<never>;
};

type PreviewProps = {
  additionalProps?: {
    withAgendaItem?: boolean;
    withNumberAndTime?: boolean;
  };
  data: OParlObjectPreviewData;
  navigation: NavigationScreenProp<never>;
};

// eslint-disable-next-line complexity
const PreviewComponent = ({ additionalProps, data, navigation }: PreviewProps) => {
  switch (data?.type) {
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
      return <MembershipPreview data={data} navigation={navigation} />;
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

export const OParlPreviewSection = ({ additionalProps, data, header, navigation }: Props) => {
  const renderPreview = useCallback(
    (itemData: OParlObjectPreviewData, key: number) => {
      return (
        <PreviewComponent
          data={itemData}
          key={key}
          navigation={navigation}
          additionalProps={additionalProps}
        />
      );
    },
    [navigation]
  );

  return <PreviewSection data={data} header={header} renderItem={renderPreview} />;
};
