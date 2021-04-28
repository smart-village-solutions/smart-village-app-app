import React from 'react';
import { NavigationScreenProp } from 'react-navigation';

import { texts } from '../../config';
import { PersonData } from '../../types';
import { WrapperHorizontal } from '../Wrapper';
import { Line, LineEntry } from './LineEntry';
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

const leftWidth = 120;

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
    <>
      <Line left={personTexts.name} right={name} leftWidth={leftWidth} fullText />
      <Line left={personTexts.title} right={title?.join(', ')} leftWidth={leftWidth} fullText />
      <Line left={personTexts.affix} right={affix} leftWidth={leftWidth} />
      <Line left={personTexts.formOfAddress} right={formOfAddress} leftWidth={leftWidth} />
      <Line left={personTexts.givenName} right={givenName} leftWidth={leftWidth} />
      <Line left={personTexts.familyName} right={familyName} leftWidth={leftWidth} />
      <Line left={personTexts.gender} right={gender} leftWidth={leftWidth} />
      {/* TODO: email mailto? */}
      <Line
        left={personTexts.email}
        right={email?.length ? email.join(', ') : undefined}
        leftWidth={leftWidth}
        fullText
      />
      <Line
        left={personTexts.phone}
        right={phone?.length ? phone.join(', ') : undefined}
        leftWidth={leftWidth}
        fullText
      />
      <Line
        left={personTexts.status}
        right={status?.length ? status.join(', ') : undefined}
        leftWidth={leftWidth}
        fullText
      />
      <OParlPreviewSection data={location} header={personTexts.location} navigation={navigation} />
      <OParlPreviewSection data={body} header={personTexts.body} navigation={navigation} />
      <OParlPreviewSection
        data={membership}
        header={personTexts.membership}
        navigation={navigation}
      />
      <WrapperHorizontal>
        <LineEntry fullText left={personTexts.life} right={life} />
        <LineEntry fullText left={personTexts.lifeSource} right={lifeSource} />
        <KeywordSection keyword={keyword} />
        <LineEntry left={personTexts.license} right={license} />
        <WebRepresentation navigation={navigation} web={web} />
        <ModifiedSection created={created} deleted={deleted} modified={modified} />
      </WrapperHorizontal>
    </>
  );
};
