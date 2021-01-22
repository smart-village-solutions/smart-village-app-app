import React, { useCallback } from 'react';
import { NavigationScreenProp } from 'react-navigation';

import { texts } from '../../config';
import { ConsultationData, OrganizationPreviewData } from '../../types';
import { PreviewSection } from '../PreviewSection';
import { BoldText, RegularText } from '../Text';
import { Wrapper, WrapperRow } from '../Wrapper';
import { AgendaItemPreview, MeetingPreview, OrganizationPreview, PaperPreview } from './previews';
import { KeywordSection, WebRepresentation } from './sections';

type Props = {
  data: ConsultationData;
  navigation: NavigationScreenProp<never>;
};

const consultationTexts = texts.oparl.consultation;

export const Consultation = ({ data, navigation }: Props) => {
  const { agendaItem, authoritative, keyword, meeting, organization, paper, role, web } = data;

  const renderOrganization = useCallback(
    (item: OrganizationPreviewData, key: number) => (
      <OrganizationPreview {...item} key={key} navigation={navigation} />
    ),
    [navigation]
  );

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
      {typeof authoritative !== undefined && (
        <WrapperRow>
          <BoldText>{consultationTexts.authoritative}</BoldText>
          <RegularText>
            {authoritative
              ? consultationTexts.isAuthoritative
              : consultationTexts.isNotAuthoritative}
          </RegularText>
        </WrapperRow>
      )}
      {!!meeting && (
        <>
          <BoldText>{consultationTexts.meeting}</BoldText>
          <MeetingPreview {...meeting} navigation={navigation} />
        </>
      )}
      {!!agendaItem && (
        <>
          <BoldText>{consultationTexts.agendaItem}</BoldText>
          <AgendaItemPreview {...agendaItem} navigation={navigation} />
        </>
      )}
      {!!paper && (
        <>
          <BoldText>{consultationTexts.paper}</BoldText>
          <PaperPreview {...paper} navigation={navigation} />
        </>
      )}
      {!!organization &&
        (organization.length === 1 ? (
          <>
            <BoldText>{consultationTexts.organization}</BoldText>
            <OrganizationPreview {...organization[0]} navigation={navigation} />
          </>
        ) : (
          <PreviewSection
            data={organization}
            renderItem={renderOrganization}
            header={<BoldText>{consultationTexts.organizations}</BoldText>}
          />
        ))}
      <KeywordSection keyword={keyword} />
      <WebRepresentation name={consultationTexts.consultation} navigation={navigation} web={web} />
    </Wrapper>
  );
};
