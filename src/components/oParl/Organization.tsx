import React, { useCallback } from 'react';
import { NavigationScreenProp } from 'react-navigation';

import { texts } from '../../config';
import { OrganizationData } from '../../types';
import { Wrapper } from '../Wrapper';
import { LineEntry } from './LineEntry';
import {
  DateSection,
  KeywordSection,
  ModifiedSection,
  OParlPreviewSection,
  WebRepresentation
} from './sections';

type Props = {
  data: OrganizationData;
  navigation: NavigationScreenProp<never>;
};

const organizationTexts = texts.oparl.organization;

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

  const onPressWebsite = useCallback(() => navigation.push('Web', { webUrl: website }), [
    navigation,
    website
  ]);

  let nameString: string | undefined;

  if (name) {
    if (shortName) {
      nameString = `${name} (${shortName})`;
    } else {
      nameString = name;
    }
  } else {
    nameString = shortName;
  }

  return (
    <Wrapper>
      <LineEntry left={organizationTexts.name} right={nameString} />
      <LineEntry left={organizationTexts.classification} right={classification} />
      <OParlPreviewSection data={body} header={organizationTexts.body} navigation={navigation} />
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
      <LineEntry left={organizationTexts.organizationType} right={organizationType} />
      <LineEntry left={organizationTexts.post} right={post?.length ? post.join(', ') : undefined} />
      <LineEntry left={organizationTexts.website} onPress={onPressWebsite} right={website} />
      <OParlPreviewSection
        data={location}
        header={organizationTexts.location}
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
        additionalProps={{ withPerson: true }}
        data={membership}
        header={organizationTexts.membership}
        navigation={navigation}
      />
      <DateSection endDate={endDate} startDate={startDate} />
      <KeywordSection keyword={keyword} />
      <LineEntry left={organizationTexts.license} right={license} />
      <WebRepresentation name={organizationTexts.organization} navigation={navigation} web={web} />
      <ModifiedSection created={created} deleted={deleted} modified={modified} />
    </Wrapper>
  );
};
