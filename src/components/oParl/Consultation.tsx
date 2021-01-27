import React from 'react';
import { NavigationScreenProp } from 'react-navigation';

import { texts } from '../../config';
import { ConsultationData } from '../../types';
import { BoldText, RegularText } from '../Text';
import { Wrapper } from '../Wrapper';
import { LineEntry } from './LineEntry';
import { AgendaItemPreview, MeetingPreview, OrganizationPreview, PaperPreview } from './previews';
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
      <RegularText />
      {!!role?.length && (
        <>
          <BoldText>{consultationTexts.role}</BoldText>
          <RegularText>{role}</RegularText>
        </>
      )}
      {authoritative !== undefined && (
        <LineEntry
          left={consultationTexts.authoritative}
          right={
            authoritative ? consultationTexts.isAuthoritative : consultationTexts.isNotAuthoritative
          }
        />
      )}
      {!!meeting && (
        <>
          <BoldText>{consultationTexts.meeting}</BoldText>
          <MeetingPreview data={meeting} navigation={navigation} />
        </>
      )}
      {!!agendaItem && (
        <>
          <BoldText>{consultationTexts.agendaItem}</BoldText>
          <AgendaItemPreview data={agendaItem} navigation={navigation} />
        </>
      )}
      {!!paper && (
        <>
          <BoldText>{consultationTexts.paper}</BoldText>
          <PaperPreview data={paper} navigation={navigation} />
        </>
      )}
      {!!organization &&
        (organization.length === 1 ? (
          <>
            <BoldText>{consultationTexts.organization}</BoldText>
            <OrganizationPreview data={organization[0]} navigation={navigation} />
          </>
        ) : (
          <OParlPreviewSection
            data={organization}
            header={consultationTexts.organizations}
            navigation={navigation}
          />
        ))}
      <KeywordSection keyword={keyword} />
      <WebRepresentation name={consultationTexts.consultation} navigation={navigation} web={web} />
    </Wrapper>
  );
};
