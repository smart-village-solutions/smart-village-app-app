import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-apollo';

import { SafeAreaViewFlex } from '../../../SafeAreaViewFlex';
import { Title, TitleContainer, TitleShadow } from '../../../Title';
import { Wrapper, WrapperVertical, WrapperWithOrientation } from '../../../Wrapper';
import { HtmlView } from '../../../HtmlView';
import { Button } from '../../../Button';
import {
  ConsulCommentList,
  ConsulTagList,
  ConsulVotingComponent,
  ConsulPublicAuthorComponent,
  Input,
  ConsulStartNewButton
} from '../../../Consul';
import { consts, device, texts } from '../../../../config';
import { useOpenWebScreen } from '../../../../hooks';
import { ConsulClient } from '../../../../ConsulClient';
import { ADD_COMMENT_TO_DEBATE } from '../../../../queries/Consul';
import { QUERY_TYPES } from '../../../../queries';
import { getConsulUser } from '../../../../helpers';

const text = texts.consul;
const a11yText = consts.a11yLabel;

/* eslint-disable complexity */
/* NOTE: we need to check a lot for presence, so this is that complex */
export const DebateDetail = ({ listData, onRefresh, route, navigation }) => {
  const [loading, setLoading] = useState();
  const [userId, setUserId] = useState();

  const {
    cachedVotesDown,
    cachedVotesTotal,
    cachedVotesUp,
    comments,
    commentsCount,
    description,
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

  useEffect(() => {
    // GET User ID
    getConsulUser().then((val) => {
      if (val) return setUserId(JSON.parse(val).id);
    });
  }, []);

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
      <WrapperWithOrientation>
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

        {/* Debate Edit Button */}
        {!!publicAuthor && publicAuthor.id === userId && (
          <ConsulStartNewButton
            data={{
              title: title,
              tagList: tags.nodes.map((item) => item.name),
              description: description,
              termsOfService: true,
              id: id
            }}
            navigation={navigation}
            title={text.startNew.updateButtonLabel}
            buttonTitle={text.startNew.updateButtonLabel}
            query={QUERY_TYPES.CONSUL.UPDATE_DEBATE}
          />
        )}

        {/* Tag List! */}
        {!!tags && tags.nodes.length > 0 && <ConsulTagList tags={tags.nodes} title={true} />}

        {/* Voting Component! */}
        <ConsulVotingComponent
          id={id}
          onRefresh={onRefresh}
          votesData={{
            cachedVotesTotal: cachedVotesTotal,
            cachedVotesUp: cachedVotesUp,
            cachedVotesDown: cachedVotesDown,
            votesFor: votesFor.nodes[0]?.voteFlag
          }}
        />

        {/* Comments List! */}
        {!!comments && (
          <ConsulCommentList
            commentCount={commentsCount}
            commentsData={comments.nodes}
            userId={userId}
            onRefresh={onRefresh}
          />
        )}

        {/* New Comment Input! */}
        <Wrapper>
          <Input
            multiline
            minHeight={50}
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
      </WrapperWithOrientation>
    </SafeAreaViewFlex>
  );
};
/* eslint-enable complexity */

DebateDetail.propTypes = {
  listData: PropTypes.object.isRequired,
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired
  }).isRequired,
  onRefresh: PropTypes.func,
  route: PropTypes.object
};
