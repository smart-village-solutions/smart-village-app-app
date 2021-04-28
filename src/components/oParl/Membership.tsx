import React from 'react';
import { NavigationScreenProp } from 'react-navigation';

import { texts } from '../../config';
import { getFullName, momentFormat } from '../../helpers';
import { MembershipData } from '../../types';
import { WrapperHorizontal } from '../Wrapper';
import { Line, LineEntry } from './LineEntry';
import { getOrganizationNameString } from './oParlHelpers';
import { KeywordSection, ModifiedSection, WebRepresentation } from './sections';

type Props = {
  data: MembershipData;
  navigation: NavigationScreenProp<never>;
};

const membershipTexts = texts.oparl.membership;

const leftWidth = 120;

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

  const fullName = getFullName('', person);

  const orgName = organization ? getOrganizationNameString(organization) : undefined;
  const onBehalfOfName = onBehalfOf ? getOrganizationNameString(onBehalfOf) : undefined;

  return (
    <>
      <Line
        left={membershipTexts.person}
        right={fullName.length ? fullName : undefined}
        fullText
        leftWidth={leftWidth}
        onPress={() =>
          navigation.push('OParlDetail', {
            type: person?.type,
            id: person?.id,
            title: texts.oparl.person.person
          })
        }
      />
      <Line left={membershipTexts.role} right={role} leftWidth={leftWidth} />
      {votingRight !== undefined && (
        <Line
          left={membershipTexts.votingRight}
          right={votingRight ? membershipTexts.hasVotingRight : membershipTexts.hasNoVotingRight}
          leftWidth={leftWidth}
        />
      )}
      <Line
        left={membershipTexts.startDate}
        right={startDate ? momentFormat(startDate, 'DD.MM.YYYY', 'x') : undefined}
        leftWidth={leftWidth}
      />
      <Line
        left={membershipTexts.endDate}
        right={endDate ? momentFormat(endDate, 'DD.MM.YYYY', 'x') : undefined}
        leftWidth={leftWidth}
      />
      <Line
        left={membershipTexts.organization}
        right={orgName}
        fullText
        leftWidth={leftWidth}
        onPress={() =>
          navigation.push('OParlDetail', {
            type: organization?.type,
            id: organization?.id,
            title: texts.oparl.organization.organization
          })
        }
      />
      <Line
        left={membershipTexts.onBehalfOf}
        right={onBehalfOfName}
        fullText
        leftWidth={leftWidth}
        onPress={() =>
          navigation.push('OParlDetail', {
            type: onBehalfOf?.type,
            id: onBehalfOf?.id,
            title: texts.oparl.organization.organization
          })
        }
      />
      <WrapperHorizontal>
        <KeywordSection keyword={keyword} />
        <LineEntry left={membershipTexts.license} right={license} />
        <WebRepresentation name={membershipTexts.membership} navigation={navigation} web={web} />
        <ModifiedSection created={created} deleted={deleted} modified={modified} />
      </WrapperHorizontal>
    </>
  );
};
