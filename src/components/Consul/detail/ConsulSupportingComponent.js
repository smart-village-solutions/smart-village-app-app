import PropTypes from 'prop-types';
import React from 'react';
import { Alert } from 'react-native';
import { useMutation } from 'react-apollo';

import { TitleContainer, Title, TitleShadow } from '../../Title';
import { Wrapper } from '../../Wrapper';
import { texts, consts, device } from '../../../config';
import { RegularText } from '../../Text';
import { SUPPORT_PROPOSAL } from '../../../queries/Consul';
import { ConsulClient } from '../../../ConsulClient';
import { Button } from '../../Button';

const text = texts.consul;
const a11yText = consts.a11yLabel;

export const ConsulSupportingComponent = (votesData) => {
  const { cachedVotesUp, id, currentUserHasVoted, onRefresh } = votesData.votesData;

  // GraphQL
  const [supportProposal] = useMutation(SUPPORT_PROPOSAL, {
    client: ConsulClient
  });

  const onVoting = async () => {
    await supportProposal({ variables: { id: id } })
      .then(() => {
        onRefresh();
        Alert.alert(text.supportProposalAlertTitle, text.supportProposalAlertBody);
      })
      .catch((err) => console.error(err));
  };

  return (
    <>
      <TitleContainer>
        <Title accessibilityLabel={`(${text.supports}) ${a11yText.heading}`}>{text.supports}</Title>
      </TitleContainer>
      {device.platform === 'ios' && <TitleShadow />}

      <Wrapper>
        <RegularText center>
          {cachedVotesUp} {text.supports}
        </RegularText>
        <RegularText center smallest>
          100 {text.supportNeed}
        </RegularText>
        {!currentUserHasVoted ? (
          <Button title="Unterstutzung" onPress={() => onVoting()} />
        ) : (
          <RegularText center>{text.proposalAlready}</RegularText>
        )}
      </Wrapper>
    </>
  );
};

ConsulSupportingComponent.propTypes = {
  votesData: PropTypes.object.isRequired
};
