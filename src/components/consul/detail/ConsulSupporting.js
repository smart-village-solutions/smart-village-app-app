import PropTypes from 'prop-types';
import React from 'react';
import { useMutation } from 'react-apollo';
import { Alert, StyleSheet, View } from 'react-native';

import { consts, device, normalize, texts } from '../../../config';
import { ConsulClient } from '../../../ConsulClient';
import { SUPPORT_PROPOSAL } from '../../../queries/consul';
import { Button } from '../../Button';
import { BoldText, RegularText } from '../../Text';
import { Title, TitleContainer, TitleShadow } from '../../Title';
import { Wrapper } from '../../Wrapper';

const a11yText = consts.a11yLabel;

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
      <TitleContainer>
        <Title accessibilityLabel={`(${texts.consul.supports}) ${a11yText.heading}`}>
          {texts.consul.supports}
        </Title>
      </TitleContainer>
      {device.platform === 'ios' && <TitleShadow />}

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
