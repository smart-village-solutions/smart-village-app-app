import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useMutation } from 'react-apollo';
import { useForm } from 'react-hook-form';

import { consts, device, texts } from '../../../../config';
import { ConsulClient } from '../../../../ConsulClient';
import { getConsulUser } from '../../../../helpers';
import { useOpenWebScreen } from '../../../../hooks';
import { ADD_COMMENT_TO_DEBATE, QUERY_TYPES } from '../../../../queries/consul';
import { ScreenName } from '../../../../types';
import { Button } from '../../../Button';
import {
  ConsulCommentList,
  ConsulPublicAuthorComponent,
  ConsulTagList,
  ConsulVotingComponent
} from '../../../consul';
import { Input } from '../../../form';
import { HtmlView } from '../../../HtmlView';
import { SafeAreaViewFlex } from '../../../SafeAreaViewFlex';
import { Title, TitleContainer, TitleShadow } from '../../../Title';
import { Wrapper, WrapperVertical, WrapperWithOrientation } from '../../../Wrapper';

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
    getConsulUser().then((val) => {
      if (val) return setUserId(JSON.parse(val).id);
    });
  }, []);

  const { control, handleSubmit, reset } = useForm();

  const [addCommentToDebate] = useMutation(ADD_COMMENT_TO_DEBATE, {
    client: ConsulClient
  });

  const onSubmit = async (val) => {
    setLoading(true);

    try {
      await addCommentToDebate({ variables: { debateId: id, body: val.comment } });
      onRefresh();
      setLoading(false);
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
          <ConsulPublicAuthorComponent
            onPress={() => {
              navigation.navigate(ScreenName.ConsulStartNewScreen, {
                title: texts.consul.startNew.updateButtonLabel,
                query: QUERY_TYPES.CONSUL.UPDATE_DEBATE,
                data: {
                  title: title,
                  tagList: tags.nodes.map((item) => item.name),
                  description: description,
                  termsOfService: true,
                  id: id
                }
              });
            }}
            authorData={{
              publicAuthor: publicAuthor,
              commentsCount: commentsCount,
              publicCreatedAt: publicCreatedAt,
              userId: userId
            }}
          />
        )}

        {!!description && (
          <Wrapper>
            <HtmlView html={description} openWebScreen={openWebScreen} />
          </Wrapper>
        )}

        {!!tags && tags.nodes.length > 0 && <ConsulTagList tags={tags.nodes} title={true} />}

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

        {!!comments && (
          <ConsulCommentList
            commentCount={commentsCount}
            commentsData={comments.nodes}
            userId={userId}
            navigation={navigation}
            onRefresh={onRefresh}
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
            rules={{ required: texts.consul.commentEmptyError }}
            control={control}
          />
          <WrapperVertical>
            <Button
              onPress={handleSubmit(onSubmit)}
              title={
                loading ? texts.consul.submittingCommentButton : texts.consul.commentAnswerButton
              }
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
