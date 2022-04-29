import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useMutation } from 'react-apollo';
import { useForm } from 'react-hook-form';

import { consts, device, texts } from '../../../../config';
import { ConsulClient } from '../../../../ConsulClient';
import { getConsulUser } from '../../../../helpers';
import { useOpenWebScreen } from '../../../../hooks';
import { QUERY_TYPES } from '../../../../queries';
import { ADD_COMMENT_TO_DEBATE } from '../../../../queries/consul';
import { ScreenName } from '../../../../types';
import { Button } from '../../../Button';
import {
  ConsulCommentList,
  ConsulPublicAuthor,
  ConsulTagList,
  ConsulVoting
} from '../../../consul';
import { Input } from '../../../form';
import { HtmlView } from '../../../HtmlView';
import { SafeAreaViewFlex } from '../../../SafeAreaViewFlex';
import { Title, TitleContainer, TitleShadow } from '../../../Title';
import { Wrapper, WrapperVertical, WrapperWithOrientation } from '../../../Wrapper';

const a11yText = consts.a11yLabel;

/* eslint-disable complexity */
/* NOTE: we need to check a lot for presence, so this is that complex */
export const DebateDetail = ({ data, refetch, route, navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
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
  } = data.debate;

  const openWebScreen = useOpenWebScreen(
    route.params?.title ?? '',
    undefined,
    route.params?.rootRouteName
  );

  useEffect(() => {
    getConsulUser().then((userInfo) => {
      if (userInfo) return setUserId(JSON.parse(userInfo).id);
    });
  }, []);

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      comment: null
    }
  });

  const [addCommentToDebate] = useMutation(ADD_COMMENT_TO_DEBATE, {
    client: ConsulClient
  });

  const onSubmit = async (commentData) => {
    if (!commentData?.comment) return;

    setIsLoading(true);

    try {
      await addCommentToDebate({ variables: { debateId: id, body: commentData.comment } });
      refetch();
      setIsLoading(false);
      reset();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <SafeAreaViewFlex>
      <WrapperWithOrientation>
        {!!title && (
          <>
            <TitleContainer>
              <Title accessibilityLabel={`(${title}) ${a11yText.heading}`}>{title}</Title>
            </TitleContainer>
            {device.platform === 'ios' && <TitleShadow />}
          </>
        )}

        {!!publicAuthor && (
          <Wrapper>
            <ConsulPublicAuthor
              authorData={{
                commentsCount,
                publicAuthor,
                publicCreatedAt,
                userId
              }}
              onPress={() => {
                navigation.navigate(ScreenName.ConsulStartNewScreen, {
                  data: {
                    description,
                    id,
                    tagList: tags.nodes.map((item) => item.name),
                    termsOfService: true,
                    title
                  },
                  query: QUERY_TYPES.CONSUL.UPDATE_DEBATE,
                  title: texts.consul.startNew.updateButtonLabel
                });
              }}
            />
          </Wrapper>
        )}

        {!!description && (
          <Wrapper>
            <HtmlView html={description} openWebScreen={openWebScreen} />
          </Wrapper>
        )}

        {!!tags && tags.nodes.length > 0 && <ConsulTagList tags={tags.nodes} title={true} />}

        <ConsulVoting
          id={id}
          refetch={refetch}
          votesData={{
            cachedVotesDown,
            cachedVotesTotal,
            cachedVotesUp,
            votesFor: votesFor.nodes[0]?.voteFlag
          }}
        />

        {!!comments && (
          <ConsulCommentList
            commentCount={commentsCount}
            commentsData={comments.nodes}
            userId={userId}
            navigation={navigation}
            refetch={refetch}
          />
        )}

        <Wrapper>
          <Input
            multiline
            minHeight={50}
            name="comment"
            label={texts.consul.commentLabel}
            placeholder={texts.consul.comment}
            autoCapitalize="none"
            control={control}
          />
          <WrapperVertical>
            <Button
              onPress={handleSubmit(onSubmit)}
              title={
                isLoading ? texts.consul.submittingCommentButton : texts.consul.commentAnswerButton
              }
              disabled={isLoading}
            />
          </WrapperVertical>
        </Wrapper>
      </WrapperWithOrientation>
    </SafeAreaViewFlex>
  );
};
/* eslint-enable complexity */

DebateDetail.propTypes = {
  data: PropTypes.object.isRequired,
  navigation: PropTypes.object.isRequired,
  refetch: PropTypes.func,
  route: PropTypes.object
};
