import React from 'react';
import { NavigationScreenProp } from 'react-navigation';

import { texts } from '../../config';
import { MembershipData } from '../../types';
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
  data: MembershipData;
  navigation: NavigationScreenProp<never>;
};

const membershipTexts = texts.oparl.membership;

export const Membership = ({ data, navigation }: Props) => {
  const {
    created,
    deleted,
    endDate,
    keyword,
    license,
    modified,
    onBehalfOf,
    organization,
    person,
    role,
    startDate,
    votingRight,
    web
  } = data;

  return (
    <Wrapper>
      <OParlPreviewSection data={person} header={membershipTexts.person} navigation={navigation} />
      <OParlPreviewSection
        data={organization}
        header={membershipTexts.organization}
        navigation={navigation}
      />
      <OParlPreviewSection
        data={onBehalfOf}
        header={membershipTexts.onBehalfOf}
        navigation={navigation}
      />
      <LineEntry left={membershipTexts.role} right={role} />
      {votingRight !== undefined && (
        <LineEntry
          left={membershipTexts.votingRight}
          right={votingRight ? membershipTexts.hasVotingRight : membershipTexts.hasNoVotingRight}
        />
      )}
      <DateSection endDate={endDate} startDate={startDate} />
      <KeywordSection keyword={keyword} />
      <LineEntry left={membershipTexts.license} right={license} />
      <WebRepresentation name={membershipTexts.membership} navigation={navigation} web={web} />
      <ModifiedSection created={created} deleted={deleted} modified={modified} />
    </Wrapper>
  );
};
