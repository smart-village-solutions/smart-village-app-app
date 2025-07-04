import { StackNavigationProp } from '@react-navigation/stack';
import React, { useCallback } from 'react';

import { texts } from '../../config';
import { momentFormat } from '../../helpers';
import { OrganizationData } from '../../types';
import { Wrapper, WrapperHorizontal } from '../Wrapper';

import { Row, SimpleRow } from './Row';
import { FormattedLocation, hasLocationData } from './previews';
import {
  KeywordSection,
  ModifiedSection,
  OParlPreviewSection,
  WebRepresentation
} from './sections';

type Props = {
  data: OrganizationData;
  navigation: StackNavigationProp<any>;
};

const organizationTexts = texts.oparl.organization;

const leftWidth = 120;

export const Organization = ({ data, navigation }: Props) => {
  const {
    body,
    classification,
    consultation,
    created,
    deleted,
    endDate,
    externalBody,
    keyword,
    license,
    location,
    meeting,
    membership,
    modified,
    name,
    organizationType,
    post,
    shortName,
    startDate,
    subOrganizationOf,
    web,
    website
  } = data;

  const onPressWebsite = useCallback(
    () => navigation.push('Web', { webUrl: website }),
    [navigation, website]
  );

  let nameString: string | undefined;

  if (name) {
    if (shortName) {
      nameString = `${name} (${shortName})`;
    } else {
      nameString = name;
    }
  } else {
    nameString = shortName ?? organizationTexts.organization;
  }

  const formattedLocation = location && <FormattedLocation location={location} />;

  return (
    <>
      <WrapperHorizontal>
        <Row
          left={organizationTexts.name}
          right={name || shortName ? nameString : undefined}
          fullText
          leftWidth={leftWidth}
        />
        <Row
          left={organizationTexts.startDate}
          right={startDate ? momentFormat(startDate, 'DD.MM.YYYY', 'x') : undefined}
          leftWidth={leftWidth}
        />
        <Row
          left={organizationTexts.endDate}
          right={endDate ? momentFormat(endDate, 'DD.MM.YYYY', 'x') : undefined}
          leftWidth={leftWidth}
        />
        <Row left={organizationTexts.classification} right={classification} leftWidth={leftWidth} />
        <Row
          left={organizationTexts.organizationType}
          right={organizationType}
          leftWidth={leftWidth}
        />
        <Row
          left={organizationTexts.body}
          right={body?.name}
          onPress={() =>
            navigation.push('OParlDetail', {
              type: body?.type,
              id: body?.id,
              title: texts.oparl.body.body
            })
          }
          leftWidth={leftWidth}
        />
        <Row
          left={organizationTexts.location}
          right={formattedLocation}
          leftWidth={leftWidth}
          onPress={
            hasLocationData(location)
              ? () =>
                  navigation.push('OParlDetail', {
                    type: location?.type,
                    id: location?.id,
                    title: texts.oparl.location.location
                  })
              : undefined
          }
        />
      </WrapperHorizontal>
      <OParlPreviewSection
        data={externalBody}
        header={organizationTexts.externalBody}
        navigation={navigation}
      />
      <OParlPreviewSection
        data={subOrganizationOf}
        header={organizationTexts.subOrganizationOf}
        navigation={navigation}
      />
      <OParlPreviewSection
        data={meeting}
        header={organizationTexts.meeting}
        navigation={navigation}
      />
      <OParlPreviewSection
        data={consultation}
        header={organizationTexts.consultation}
        navigation={navigation}
      />
      <OParlPreviewSection
        data={membership}
        header={organizationTexts.membership}
        navigation={navigation}
        withPerson
      />
      <Wrapper>
        <SimpleRow left={organizationTexts.website} onPress={onPressWebsite} right={website} />
        <SimpleRow
          left={organizationTexts.post}
          right={post?.length ? post.join(', ') : undefined}
          fullText
        />
        <KeywordSection keyword={keyword} />
        <SimpleRow left={organizationTexts.license} right={license} />
        <WebRepresentation
          name={organizationTexts.organization}
          navigation={navigation}
          web={web}
        />
        <ModifiedSection created={created} deleted={deleted} modified={modified} />
      </Wrapper>
    </>
  );
};
