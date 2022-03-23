import PropTypes from 'prop-types';
import React from 'react';
import { ScrollView } from 'react-native';

import { consts, device } from '../../../config';
import { useOpenWebScreen } from '../../../hooks';
import {
  DefaultKeyboardAvoidingView,
  SafeAreaViewFlex,
  Title,
  TitleContainer,
  TitleShadow,
  Wrapper,
  HtmlView,
  ConsulCommentList,
  ConsulTagList,
  ConsulVotingComponent,
  ConsulPublicAuthorComponent
} from '../..';

const a11yText = consts.a11yLabel;

/* eslint-disable complexity */
/* NOTE: we need to check a lot for presence, so this is that complex */
export const DebateDetail = ({ listData, query, route }) => {
  const {
    cachedVotesDown,
    cachedVotesUp,
    cachedVotesTotal,
    comments,
    commentsCount,
    confidenceScore,
    description,
    hotScore,
    id,
    publicAuthor,
    publicCreatedAt,
    tags,
    title,
    votesFor
  } = listData.debate;

  const openWebScreen = useOpenWebScreen(
    route.params?.title ?? '',
    undefined,
    route.params?.rootRouteName
  );

  return (
    <SafeAreaViewFlex>
      <DefaultKeyboardAvoidingView>
        <ScrollView keyboardShouldPersistTaps="handled">
          {!!title && (
            <>
              <TitleContainer>
                <Title accessibilityLabel={`(${title}) ${a11yText.heading}`}>{title}</Title>
              </TitleContainer>
              {device.platform === 'ios' && <TitleShadow />}
            </>
          )}

          {!!publicAuthor && (
            <ConsulPublicAuthorComponent
              authorData={{
                publicAuthor: publicAuthor,
                commentsCount: commentsCount,
                publicCreatedAt: publicCreatedAt
              }}
            />
          )}

          {!!description && (
            <Wrapper>
              <HtmlView html={description} openWebScreen={openWebScreen} />
            </Wrapper>
          )}

          {!!tags && <ConsulTagList tags={tags.nodes} />}

          <ConsulVotingComponent
            votesData={{
              cachedVotesTotal: cachedVotesTotal,
              cachedVotesUp: cachedVotesUp,
              cachedVotesDown: cachedVotesDown
            }}
          />

          {!!comments && (
            <ConsulCommentList commentCount={commentsCount} commentsData={comments.nodes} />
          )}
        </ScrollView>
      </DefaultKeyboardAvoidingView>
    </SafeAreaViewFlex>
  );
};
/* eslint-enable complexity */

DebateDetail.propTypes = {
  listData: PropTypes.object.isRequired,
  query: PropTypes.string,
  route: PropTypes.object
};
