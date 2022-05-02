import PropTypes from 'prop-types';
import React from 'react';
import { useMutation } from 'react-apollo';
import { StyleSheet } from 'react-native';

import { colors, consts, device, Icon, normalize, texts } from '../../../config';
import { ConsulClient } from '../../../ConsulClient';
import { CAST_VOTE_ON_DEBATE } from '../../../queries/consul';
import { RegularText } from '../../Text';
import { Title, TitleContainer, TitleShadow } from '../../Title';
import { Touchable } from '../../Touchable';
import { Wrapper, WrapperRow } from '../../Wrapper';

const a11yText = consts.a11yLabel;

export const ConsulVoting = ({ votesData, refetch, id }) => {
  const { cachedVotesDown, cachedVotesTotal, cachedVotesUp, votesFor } = votesData;

  let downVotesPercent = 0;
  let upVotesPercent = 0;
  if (cachedVotesTotal) {
    downVotesPercent = (cachedVotesDown * 100) / cachedVotesTotal;
    upVotesPercent = (cachedVotesUp * 100) / cachedVotesTotal;
  }

  const [castVoteOnDebate] = useMutation(CAST_VOTE_ON_DEBATE, {
    client: ConsulClient
  });

  const onVoting = async (UpDown) => {
    try {
      await castVoteOnDebate({ variables: { debateId: id, vote: UpDown } });
      refetch();
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

          <RegularText small>
            {cachedVotesTotal > 0
              ? `${cachedVotesTotal} ${
                  cachedVotesTotal > 1 ? texts.consul.votes : texts.consul.vote
                }`
              : texts.consul.noVotes}
          </RegularText>
        </WrapperRow>
      </Wrapper>
    </>
  );
};

const styles = StyleSheet.create({
  icon: {
    paddingHorizontal: normalize(5)
  },
  iconButton: {
    alignItems: 'center',
    marginHorizontal: normalize(10)
  }
});

ConsulVoting.propTypes = {
  id: PropTypes.string,
  refetch: PropTypes.func,
  votesData: PropTypes.object.isRequired
};
