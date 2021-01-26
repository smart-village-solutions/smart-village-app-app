import React from 'react';
import { NavigationScreenProp } from 'react-navigation';

import { texts } from '../../config';
import { MembershipData } from '../../types';
import { BoldText } from '../Text';
import { Wrapper } from '../Wrapper';
import { LineEntry } from './LineEntry';
import { OrganizationPreview, PersonPreview } from './previews';
import { DateSection, KeywordSection, WebRepresentation } from './sections';

type Props = {
  data: MembershipData;
  navigation: NavigationScreenProp<never>;
};

const membershipTexts = texts.oparl.membership;

export const Membership = ({ data, navigation }: Props) => {
  const {
    endDate,
    keyword,
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
      {!!person && (
        <>
          <BoldText>{membershipTexts.person}</BoldText>
          <PersonPreview data={person} navigation={navigation} />
        </>
      )}
      {!!organization && (
        <>
          <BoldText>{membershipTexts.organization}</BoldText>
          <OrganizationPreview data={organization} navigation={navigation} />
        </>
      )}
      {!!onBehalfOf && (
        <>
          <BoldText>{membershipTexts.onBehalfOf}</BoldText>
          <OrganizationPreview data={onBehalfOf} navigation={navigation} />
        </>
      )}
      <LineEntry left={membershipTexts.role} right={role} />
      {votingRight !== undefined && (
        <LineEntry
          left={membershipTexts.votingRight}
          right={votingRight ? membershipTexts.hasVotingRight : membershipTexts.hasNoVotingRight}
        />
      )}
      <DateSection endDate={endDate} startDate={startDate} />
      <KeywordSection keyword={keyword} />
      <WebRepresentation name={membershipTexts.membership} navigation={navigation} web={web} />
    </Wrapper>
  );
};
