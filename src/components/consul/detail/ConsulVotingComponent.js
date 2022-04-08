import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet } from 'react-native';
import { useMutation } from 'react-apollo';

import { TitleContainer, Title, TitleShadow } from '../../Title';
import { Wrapper, WrapperRow } from '../../Wrapper';
import { texts, consts, device, colors, Icon, normalize } from '../../../config';
import { RegularText } from '../../Text';
import { Touchable } from '../../Touchable';
import { ConsulClient } from '../../../ConsulClient';
import { CAST_VOTE_ON_DEBATE } from '../../../queries/Consul';

const text = texts.consul;
const a11yText = consts.a11yLabel;

export const ConsulVotingComponent = ({ votesData, onRefresh, id }) => {
  const { cachedVotesTotal, cachedVotesUp, cachedVotesDown, votesFor } = votesData;

  let upVotesPercent = 0;
  let downVotesPercent = 0;
  if (cachedVotesTotal) {
    upVotesPercent = (cachedVotesUp * 100) / cachedVotesTotal;
    downVotesPercent = (cachedVotesDown * 100) / cachedVotesTotal;
  }

  const [castVoteOnDebate] = useMutation(CAST_VOTE_ON_DEBATE, {
    client: ConsulClient
  });

  const onVoting = async (UpDown) => {
    await castVoteOnDebate({ variables: { debateId: id, vote: UpDown } })
      .then(() => {
        onRefresh();
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
        <WrapperRow spaceBetween>
          <WrapperRow>
            <Touchable onPress={() => onVoting('up')} style={styles.iconButton}>
              <Icon.Like
                color={votesFor !== undefined && votesFor ? colors.primary : colors.darkText}
                size={normalize(16)}
                style={styles.icon}
              />
              <RegularText smallest>%{upVotesPercent.toFixed(0)}</RegularText>
            </Touchable>

            <Touchable onPress={() => onVoting('down')} style={styles.iconButton}>
              <Icon.Like
                color={votesFor !== undefined && !votesFor ? colors.error : colors.darkText}
                style={[styles.icon, { transform: [{ rotateX: '180deg' }] }]}
                size={normalize(16)}
              />
              <RegularText smallest>%{downVotesPercent.toFixed(0)}</RegularText>
            </Touchable>
          </WrapperRow>

          {cachedVotesTotal > 0 ? (
            <RegularText small>
              {cachedVotesTotal} {text.votes}
            </RegularText>
          ) : (
            <RegularText small>{text.noVotes}</RegularText>
          )}
        </WrapperRow>
      </Wrapper>
    </>
  );
};

ConsulVotingComponent.propTypes = {
  votesData: PropTypes.object.isRequired,
  id: PropTypes.string,
  onRefresh: PropTypes.object
};

const styles = StyleSheet.create({
  iconButton: {
    alignItems: 'center',
    marginHorizontal: 10
  },
  icon: {
    paddingHorizontal: 10
  }
});
