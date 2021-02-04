import React from 'react';
import { NavigationScreenProp } from 'react-navigation';

import { texts } from '../../config';
import { PersonData } from '../../types';
import { BoldText, RegularText } from '../Text';
import { Wrapper } from '../Wrapper';
import { LineEntry } from './LineEntry';
import {
  KeywordSection,
  ModifiedSection,
  OParlPreviewSection,
  WebRepresentation
} from './sections';

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
    license,
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
      <LineEntry
        fullText
        left={personTexts.email}
        right={email?.length ? email.join(', ') : undefined}
      />
      <LineEntry
        fullText
        left={personTexts.phone}
        right={phone?.length ? phone.join(', ') : undefined}
      />
      <OParlPreviewSection data={location} header={personTexts.location} navigation={navigation} />
      <LineEntry
        fullText
        left={personTexts.status}
        right={status?.length ? status.join(', ') : undefined}
      />
      <OParlPreviewSection data={body} header={personTexts.body} navigation={navigation} />
      <OParlPreviewSection
        data={membership}
        header={personTexts.membership}
        navigation={navigation}
      />
      <LineEntry fullText left={personTexts.life} right={life} />
      <LineEntry fullText left={personTexts.lifeSource} right={lifeSource} />
      <KeywordSection keyword={keyword} />
      <LineEntry left={personTexts.license} right={license} />
      <WebRepresentation name={name ?? personTexts.person} navigation={navigation} web={web} />
      <ModifiedSection created={created} deleted={deleted} modified={modified} />
    </Wrapper>
  );
};
