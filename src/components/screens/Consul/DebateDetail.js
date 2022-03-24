import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-apollo';

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
  ConsulPublicAuthorComponent,
  WrapperVertical,
  Input,
  Button
} from '../..';
import { consts, device, texts } from '../../../config';
import { useOpenWebScreen } from '../../../hooks';
import { ConsulClient } from '../../../ConsulClient';
import { ADD_COMMENT_TO_DEBATE } from '../../../queries/Consul';

const text = texts.consul;
const a11yText = consts.a11yLabel;

/* eslint-disable complexity */
/* NOTE: we need to check a lot for presence, so this is that complex */
export const DebateDetail = ({ listData, onRefresh, route }) => {
  const [loading, setLoading] = useState();
  const {
    cachedVotesDown,
    cachedVotesUp,
    cachedVotesTotal,
    comments,
    commentsCount,
    description,
    id,
    publicAuthor,
    publicCreatedAt,
    tags,
    title
  } = listData.debate;

  const openWebScreen = useOpenWebScreen(
    route.params?.title ?? '',
    undefined,
    route.params?.rootRouteName
  );

  // React Hook Form
  const { control, handleSubmit, reset } = useForm();

  // GraphQL
  const [addCommentToDebate] = useMutation(ADD_COMMENT_TO_DEBATE, {
    client: ConsulClient
  });

  const onSubmit = async (val) => {
    setLoading(true);
    await addCommentToDebate({ variables: { debateId: id, body: val.comment } })
      .then(() => {
        onRefresh();
        setLoading(false);
        reset({ comment: null });
      })
      .catch((err) => console.error(err));
  };

  return (
    <SafeAreaViewFlex>
      <DefaultKeyboardAvoidingView>
        <ScrollView keyboardShouldPersistTaps="handled">
          {/* Title! */}
          {!!title && (
            <>
              <TitleContainer>
                <Title accessibilityLabel={`(${title}) ${a11yText.heading}`}>{title}</Title>
              </TitleContainer>
              {device.platform === 'ios' && <TitleShadow />}
            </>
          )}

          {/* Author! */}
          {!!publicAuthor && (
            <ConsulPublicAuthorComponent
              authorData={{
                publicAuthor: publicAuthor,
                commentsCount: commentsCount,
                publicCreatedAt: publicCreatedAt
              }}
            />
          )}

          {/* Description! */}
          {!!description && (
            <Wrapper>
              <HtmlView html={description} openWebScreen={openWebScreen} />
            </Wrapper>
          )}

          {/* Tag List! */}
          {!!tags && <ConsulTagList tags={tags.nodes} />}

          {/* Voting Component! */}
          <ConsulVotingComponent
            votesData={{
              cachedVotesTotal: cachedVotesTotal,
              cachedVotesUp: cachedVotesUp,
              cachedVotesDown: cachedVotesDown
            }}
          />

          {/* Comments List! */}
          {!!comments && (
            <ConsulCommentList
              commentCount={commentsCount}
              commentsData={comments.nodes}
              onRefresh={onRefresh}
            />
          )}

          {/* New Comment Input! */}
          <Wrapper>
            <Input
              multiline
              name="comment"
              label={text.commentLabel}
              placeholder={text.comment}
              autoCapitalize="none"
              rules={{ required: text.commentEmptyError }}
              control={control}
            />
            <WrapperVertical>
              <Button
                onPress={handleSubmit(onSubmit)}
                title={loading ? text.submittingCommentButton : text.commentAnswerButton}
                disabled={loading}
              />
            </WrapperVertical>
          </Wrapper>
        </ScrollView>
      </DefaultKeyboardAvoidingView>
    </SafeAreaViewFlex>
  );
};
/* eslint-enable complexity */

DebateDetail.propTypes = {
  listData: PropTypes.object.isRequired,
  onRefresh: PropTypes.func,
  route: PropTypes.object
};
