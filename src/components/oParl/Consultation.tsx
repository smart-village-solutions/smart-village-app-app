import React from 'react';
import { NavigationScreenProp } from 'react-navigation';

import { texts } from '../../config';
import { ConsultationData } from '../../types';
import { Wrapper } from '../Wrapper';

import { SimpleRow } from './Row';
import {
  KeywordSection,
  ModifiedSection,
  OParlPreviewSection,
  WebRepresentation
} from './sections';

type Props = {
  data: ConsultationData;
  navigation: NavigationScreenProp<never>;
};

const consultationTexts = texts.oparl.consultation;

export const Consultation = ({ data, navigation }: Props) => {
  const {
    agendaItem,
    authoritative,
    created,
    deleted,
    keyword,
    license,
    meeting,
    modified,
    organization,
    paper,
    role,
    web
  } = data;

  return (
    <>
      <OParlPreviewSection
        data={meeting}
        header={consultationTexts.meeting}
        navigation={navigation}
      />
      <OParlPreviewSection
        data={agendaItem}
        header={consultationTexts.agendaItem}
        navigation={navigation}
      />
      <OParlPreviewSection data={paper} header={consultationTexts.paper} navigation={navigation} />
      <OParlPreviewSection
        data={organization}
        header={
          organization?.length === 1
            ? consultationTexts.organization
            : consultationTexts.organizations
        }
        navigation={navigation}
      />
      <Wrapper>
        {authoritative != undefined && ( // also filter out null
          <SimpleRow
            left={consultationTexts.authoritative}
            right={
              authoritative
                ? consultationTexts.isAuthoritative
                : consultationTexts.isNotAuthoritative
            }
          />
        )}
        <SimpleRow left={consultationTexts.role} right={role} />
        <KeywordSection keyword={keyword} />
        <SimpleRow left={consultationTexts.license} right={license} />
        <WebRepresentation
          name={consultationTexts.consultation}
          navigation={navigation}
          web={web}
        />
        <ModifiedSection created={created} deleted={deleted} modified={modified} />
      </Wrapper>
    </>
  );
};
