import PropTypes from 'prop-types';
import React from 'react';
import { Text } from 'react-native';

import { TitleContainer, Title, TitleShadow } from '../../Title';
import { Wrapper, WrapperRow } from '../../Wrapper';
import { texts, consts, device } from '../../../config';

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

      {/* TODO: SVG icon will be added */}
      <Wrapper>
        <WrapperRow spaceBetween>
          <WrapperRow>
            <Text>%{upVotesPercent}</Text>
            <Text>%{downVotesPercent}</Text>
          </WrapperRow>

          {cachedVotesTotal > 0 ? (
            <Text>
              {cachedVotesTotal} {text.votes}
            </Text>
          ) : (
            <Text>{text.noVotes}</Text>
          )}
        </WrapperRow>
      </Wrapper>
    </>
  );
};

ConsulVotingComponent.propTypes = {
  votesData: PropTypes.object.isRequired
};
