import React from 'react';
import { StackNavigationProp } from '@react-navigation/stack';

import { texts } from '../../config';
import { getFullName, momentFormat } from '../../helpers';
import { MembershipData } from '../../types';
import { Wrapper, WrapperHorizontal } from '../Wrapper';

import { Row, SimpleRow } from './Row';
import { getOrganizationNameString } from './oParlHelpers';
import { KeywordSection, ModifiedSection, WebRepresentation } from './sections';

type Props = {
  data: MembershipData;
  navigation: StackNavigationProp<any>;
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
      <WrapperHorizontal>
        <Row
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
        <Row left={membershipTexts.role} right={role} leftWidth={leftWidth} />
        {votingRight !== undefined && (
          <Row
            left={membershipTexts.votingRight}
            right={votingRight ? membershipTexts.hasVotingRight : membershipTexts.hasNoVotingRight}
            leftWidth={leftWidth}
          />
        )}
        <Row
          left={membershipTexts.startDate}
          right={startDate ? momentFormat(startDate, 'DD.MM.YYYY', 'x') : undefined}
          leftWidth={leftWidth}
        />
        <Row
          left={membershipTexts.endDate}
          right={endDate ? momentFormat(endDate, 'DD.MM.YYYY', 'x') : undefined}
          leftWidth={leftWidth}
        />
        <Row
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
        <Row
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
      </WrapperHorizontal>
      <Wrapper>
        <KeywordSection keyword={keyword} />
        <SimpleRow left={membershipTexts.license} right={license} />
        <WebRepresentation name={membershipTexts.membership} navigation={navigation} web={web} />
        <ModifiedSection created={created} deleted={deleted} modified={modified} />
      </Wrapper>
    </>
  );
};
