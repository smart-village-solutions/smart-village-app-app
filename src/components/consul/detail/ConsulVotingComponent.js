import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet } from 'react-native';

import { TitleContainer, Title, TitleShadow } from '../../Title';
import { Wrapper, WrapperRow } from '../../Wrapper';
import { texts, consts, device, colors, Icon, normalize } from '../../../config';
import { RegularText } from '../../Text';

const text = texts.consul;
const a11yText = consts.a11yLabel;

export const ConsulVotingComponent = (votesData) => {
  const { cachedVotesTotal, cachedVotesUp, cachedVotesDown } = votesData.votesData;

  let upVotesPercent = 0;
  let downVotesPercent = 0;
  if (cachedVotesTotal) {
    upVotesPercent = (cachedVotesUp * 100) / cachedVotesTotal;
    downVotesPercent = (cachedVotesDown * 100) / cachedVotesTotal;
  }

  return (
    <>
      <TitleContainer>
        <Title accessibilityLabel={`(${text.supports}) ${a11yText.heading}`}>{text.supports}</Title>
      </TitleContainer>
      {device.platform === 'ios' && <TitleShadow />}

      <Wrapper>
        <WrapperRow spaceBetween>
          <WrapperRow>
            <Icon.Like color={colors.placeholder} size={normalize(16)} style={styles.icon} />
            <RegularText smallest placeholder>
              %{upVotesPercent}
            </RegularText>
            <Icon.Like
              color={colors.placeholder}
              style={[styles.icon, { transform: [{ rotateX: '180deg' }] }]}
              size={normalize(16)}
            />
            <RegularText smallest placeholder>
              %{downVotesPercent}
            </RegularText>
          </WrapperRow>

          {cachedVotesTotal > 0 ? (
            <RegularText small placeholder>
              {cachedVotesTotal} {text.votes}
            </RegularText>
          ) : (
            <RegularText small placeholder>
              {text.noVotes}
            </RegularText>
          )}
        </WrapperRow>
      </Wrapper>
    </>
  );
};

ConsulVotingComponent.propTypes = {
  votesData: PropTypes.object.isRequired
};

const styles = StyleSheet.create({
  icon: {
    paddingHorizontal: 10
  }
});
