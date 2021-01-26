import React, { useCallback } from 'react';
import { NavigationScreenProp } from 'react-navigation';

import { texts } from '../../config';
import { MembershipPreviewData, PersonData } from '../../types';
import { PreviewSection } from '../PreviewSection';
import { BoldText, RegularText } from '../Text';
import { Wrapper } from '../Wrapper';
import { LineEntry } from './LineEntry';
import { BodyPreview, LocationPreview, MembershipPreview } from './previews';
import { KeywordSection, ModifiedSection, WebRepresentation } from './sections';

type Props = {
  data: PersonData;
  navigation: NavigationScreenProp<never>;
};

const personTexts = texts.oparl.person;

export const Person = ({ data, navigation }: Props) => {
  const {
    affix,
    body,
    created,
    deleted,
    email,
    familyName,
    formOfAddress,
    gender,
    givenName,
    keyword,
    life,
    lifeSource,
    location,
    membership,
    modified,
    name,
    phone,
    status,
    title,
    web
  } = data;

  const renderMembershipPreview = useCallback(
    (data: MembershipPreviewData, key: number) => (
      <MembershipPreview data={data} key={key} navigation={navigation} />
    ),
    [navigation]
  );

  return (
    <Wrapper>
      {!!name && (
        <>
          <BoldText>{personTexts.name}</BoldText>
          <RegularText>{name}</RegularText>
        </>
      )}
      {!!title?.length && (
        <>
          <BoldText>{personTexts.title}</BoldText>
          <RegularText>{title.join(', ')}</RegularText>
        </>
      )}
      <LineEntry left={personTexts.affix} right={affix} />
      <LineEntry left={personTexts.formOfAddress} right={formOfAddress} />
      <LineEntry left={personTexts.givenName} right={givenName} />
      <LineEntry left={personTexts.familyName} right={familyName} />
      <LineEntry left={personTexts.gender} right={gender} />
      {/* TODO: email mailto? */}
      {!!email?.length && (
        <>
          <BoldText>{personTexts.email}</BoldText>
          <RegularText>{email.join(', ')}</RegularText>
        </>
      )}
      {!!phone?.length && (
        <>
          <BoldText>{personTexts.phone}</BoldText>
          <RegularText>{phone.join(', ')}</RegularText>
        </>
      )}
      {!!location && (
        <>
          <BoldText>{personTexts.location}</BoldText>
          <LocationPreview data={location} navigation={navigation} />
        </>
      )}
      {!!status?.length && (
        <>
          <BoldText>{personTexts.status}</BoldText>
          <RegularText>{status.join(', ')}</RegularText>
        </>
      )}
      {!!body && (
        <>
          <BoldText>{personTexts.body}</BoldText>
          <BodyPreview data={body} navigation={navigation} />
        </>
      )}
      <PreviewSection
        data={membership}
        header={personTexts.membership}
        renderItem={renderMembershipPreview}
      />
      {!!life && (
        <>
          <BoldText>{personTexts.life}</BoldText>
          <RegularText>{life}</RegularText>
        </>
      )}
      {!!lifeSource && (
        <>
          <BoldText>{personTexts.lifeSource}</BoldText>
          <RegularText>{lifeSource}</RegularText>
        </>
      )}
      <KeywordSection keyword={keyword} />
      <WebRepresentation name={name ?? personTexts.person} navigation={navigation} web={web} />
      <ModifiedSection created={created} deleted={deleted} modified={modified} />
    </Wrapper>
  );
};
