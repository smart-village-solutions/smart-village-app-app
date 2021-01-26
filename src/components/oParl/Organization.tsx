import React, { useCallback } from 'react';
import { NavigationScreenProp } from 'react-navigation';

import { texts } from '../../config';
import { MeetingPreviewData, MembershipPreviewData, OrganizationData } from '../../types';
import { PreviewSection } from '../PreviewSection';
import { BoldText, RegularText } from '../Text';
import { Wrapper } from '../Wrapper';
import { LineEntry } from './LineEntry';
import {
  BodyPreview,
  LocationPreview,
  MeetingPreview,
  MembershipPreview,
  OrganizationPreview
} from './previews';
import { DateSection, KeywordSection, ModifiedSection, WebRepresentation } from './sections';

type Props = {
  data: OrganizationData;
  navigation: NavigationScreenProp<never>;
};

const organizationTexts = texts.oparl.organization;

export const Organization = ({ data, navigation }: Props) => {
  const {
    body,
    classification,
    created,
    deleted,
    endDate,
    externalBody,
    keyword,
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

  const renderMeetingPreview = useCallback(
    (data: MeetingPreviewData, key: number) => (
      <MeetingPreview data={data} key={key} navigation={navigation} />
    ),
    [navigation]
  );

  const renderMembershipPreview = useCallback(
    (data: MembershipPreviewData, key: number) => (
      <MembershipPreview data={data} key={key} navigation={navigation} />
    ),
    [navigation]
  );

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
      {!!body && (
        <>
          <BoldText>{organizationTexts.body}</BoldText>
          <BodyPreview data={body} navigation={navigation} />
        </>
      )}
      {!!externalBody && (
        <>
          <BoldText>{organizationTexts.externalBody}</BoldText>
          <BodyPreview data={externalBody} navigation={navigation} />
        </>
      )}
      {!!subOrganizationOf && (
        <>
          <BoldText>{organizationTexts.subOrganizationOf}</BoldText>
          <OrganizationPreview data={subOrganizationOf} navigation={navigation} />
        </>
      )}
      <LineEntry left={organizationTexts.organizationType} right={organizationType} />
      {!!post?.length && (
        <>
          <BoldText>{organizationTexts.externalBody}</BoldText>
          <RegularText>{post.join(', ')}</RegularText>
        </>
      )}
      <LineEntry left={organizationTexts.website} onPress={onPressWebsite} right={website} />
      {!!location && (
        <>
          <BoldText>{organizationTexts.location}</BoldText>
          <LocationPreview data={location} navigation={navigation} />
        </>
      )}
      <PreviewSection
        data={meeting}
        header={organizationTexts.meeting}
        renderItem={renderMeetingPreview}
      />
      <PreviewSection
        data={membership}
        header={organizationTexts.meeting}
        renderItem={renderMembershipPreview}
      />
      <DateSection endDate={endDate} startDate={startDate} />
      <KeywordSection keyword={keyword} />
      <WebRepresentation name={organizationTexts.organization} navigation={navigation} web={web} />
      <ModifiedSection created={created} deleted={deleted} modified={modified} />
    </Wrapper>
  );
};
