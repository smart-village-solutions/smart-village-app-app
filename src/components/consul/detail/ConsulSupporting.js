import PropTypes from 'prop-types';
import React from 'react';
import { useMutation } from 'react-apollo';
import { Alert, StyleSheet, View } from 'react-native';

import { ConsulClient } from '../../../ConsulClient';
import { normalize, texts } from '../../../config';
import { SUPPORT_PROPOSAL } from '../../../queries/consul';
import { Button } from '../../Button';
import { SectionHeader } from '../../SectionHeader';
import { BoldText, RegularText } from '../../Text';
import { Wrapper } from '../../Wrapper';

export const ConsulSupporting = (votesData) => {
  const { cachedVotesUp, currentUserHasVoted, id, refetch } = votesData.votesData;

  const [supportProposal] = useMutation(SUPPORT_PROPOSAL, {
    client: ConsulClient
  });

  const onVoting = async () => {
    try {
      await supportProposal({ variables: { id: id } });
      refetch();
      Alert.alert(texts.consul.supportProposalAlertTitle, texts.consul.supportProposalAlertBody);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <SectionHeader title={texts.consul.supports} />
      <Wrapper>
        <BoldText center>
          {cachedVotesUp} {texts.consul.supports}
        </BoldText>
        <RegularText center smallest>
          100 {texts.consul.supportNeed}
        </RegularText>
        <View style={styles.buttonContainer}>
          {!currentUserHasVoted ? (
            <Button title={texts.consul.support} onPress={() => onVoting()} />
          ) : (
            <RegularText center small>
              {texts.consul.proposalAlready}
            </RegularText>
          )}
        </View>
      </Wrapper>
    </>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    marginTop: normalize(10)
  }
});

ConsulSupporting.propTypes = {
  votesData: PropTypes.object.isRequired
};
