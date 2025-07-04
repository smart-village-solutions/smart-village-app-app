import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';

import { texts } from '../../config';
import { PersonData } from '../../types';
import { Wrapper, WrapperHorizontal } from '../Wrapper';

import { getOrganizationNameString } from './oParlHelpers';
import { FormattedLocation, hasLocationData } from './previews';
import { Row, SimpleRow } from './Row';
import {
  KeywordSection,
  ModifiedSection,
  OParlPreviewSection,
  WebRepresentation
} from './sections';

type Props = {
  data: PersonData;
  navigation: StackNavigationProp<any>;
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

  const faction = membership?.find(
    (membership) => membership.organization?.classification === 'Fraktion' && !membership.endDate
  );

  const formattedLocation = location && <FormattedLocation location={location} />;

  return (
    <>
      <WrapperHorizontal>
        <Row left={personTexts.name} right={name} leftWidth={leftWidth} fullText />
        <Row left={personTexts.title} right={title?.join(', ')} leftWidth={leftWidth} fullText />
        <Row left={personTexts.affix} right={affix} leftWidth={leftWidth} />
        <Row left={personTexts.formOfAddress} right={formOfAddress} leftWidth={leftWidth} />
        <Row left={personTexts.givenName} right={givenName} leftWidth={leftWidth} />
        <Row left={personTexts.familyName} right={familyName} leftWidth={leftWidth} />
        <Row
          left={personTexts.faction}
          right={faction?.organization && getOrganizationNameString(faction.organization)}
          leftWidth={leftWidth}
          onPress={() =>
            navigation.push('OParlDetail', {
              id: faction?.id,
              type: faction?.type,
              title: texts.oparl.membership.membership
            })
          }
        />
        <Row left={personTexts.gender} right={gender} leftWidth={leftWidth} />
        <Row
          left={personTexts.email}
          right={email?.length ? email.join(', ') : undefined}
          leftWidth={leftWidth}
          fullText
        />
        <Row
          left={personTexts.phone}
          right={phone?.length ? phone.join(', ') : undefined}
          leftWidth={leftWidth}
          fullText
        />
        <Row
          left={personTexts.status}
          right={status?.length ? status.join(', ') : undefined}
          leftWidth={leftWidth}
          fullText
        />
      </WrapperHorizontal>
      <OParlPreviewSection
        data={location}
        header={personTexts.location}
        navigation={hasLocationData(location) ? navigation : undefined}
      />
      <OParlPreviewSection data={body} header={personTexts.body} navigation={navigation} />
      <OParlPreviewSection
        data={membership}
        header={personTexts.membership}
        navigation={navigation}
      />
      <Wrapper>
        <SimpleRow fullText left={personTexts.life} right={life} />
        <SimpleRow fullText left={personTexts.lifeSource} right={lifeSource} />
        <KeywordSection keyword={keyword} />
        <SimpleRow left={personTexts.license} right={license} />
        <WebRepresentation name={name || personTexts.person} navigation={navigation} web={web} />
        <ModifiedSection created={created} deleted={deleted} modified={modified} />
      </Wrapper>
    </>
  );
};
