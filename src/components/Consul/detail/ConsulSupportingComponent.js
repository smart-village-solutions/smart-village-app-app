import PropTypes from 'prop-types';
import React from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useMutation } from 'react-apollo';

import { TitleContainer, Title, TitleShadow } from '../../Title';
import { Wrapper } from '../../Wrapper';
import { texts, consts, device, normalize } from '../../../config';
import { BoldText, RegularText } from '../../Text';
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
        <BoldText center>
          {cachedVotesUp} {text.supports}
        </BoldText>
        <RegularText center smallest>
          100 {text.supportNeed}
        </RegularText>
        <View style={styles.buttonContainer}>
          {!currentUserHasVoted ? (
            <Button title="Unterstutzung" onPress={() => onVoting()} />
          ) : (
            <RegularText center small>
              {text.proposalAlready}
            </RegularText>
          )}
        </View>
      </Wrapper>
    </>
  );
};

ConsulSupportingComponent.propTypes = {
  votesData: PropTypes.object.isRequired
};

const styles = StyleSheet.create({
  buttonContainer: {
    marginTop: normalize(10)
  }
});
