import React from 'react';
import { NavigationScreenProp } from 'react-navigation';

import { texts } from '../../config';
import { ConsultationData } from '../../types';
import { BoldText } from '../Text';
import { Wrapper } from '../Wrapper';
import { LineEntry } from './LineEntry';
import { KeywordSection, OParlPreviewSection, WebRepresentation } from './sections';

type Props = {
  data: ConsultationData;
  navigation: NavigationScreenProp<never>;
};

const consultationTexts = texts.oparl.consultation;

export const Consultation = ({ data, navigation }: Props) => {
  const { agendaItem, authoritative, keyword, meeting, organization, paper, role, web } = data;

  return (
    <Wrapper>
      <BoldText>{consultationTexts.consultationLong}</BoldText>
      <LineEntry left={consultationTexts.role} right={role} />
      {authoritative !== undefined && (
        <LineEntry
          left={consultationTexts.authoritative}
          right={
            authoritative ? consultationTexts.isAuthoritative : consultationTexts.isNotAuthoritative
          }
        />
      )}
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
      <KeywordSection keyword={keyword} />
      <WebRepresentation name={consultationTexts.consultation} navigation={navigation} web={web} />
    </Wrapper>
  );
};
