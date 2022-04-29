import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useMutation } from 'react-apollo';
import { useForm } from 'react-hook-form';

import { consts, device, texts } from '../../../../config';
import { ConsulClient } from '../../../../ConsulClient';
import { getConsulUser } from '../../../../helpers';
import { useOpenWebScreen } from '../../../../hooks';
import { ADD_COMMENT_TO_POLLS } from '../../../../queries/consul';
import { Button } from '../../../Button';
import { ConsulCommentList, ConsulQuestionsList, ConsulSummary } from '../../../consul';
import { Input } from '../../../form';
import { HtmlView } from '../../../HtmlView';
import { SafeAreaViewFlex } from '../../../SafeAreaViewFlex';
import { Title, TitleContainer, TitleShadow } from '../../../Title';
import { Wrapper, WrapperVertical, WrapperWithOrientation } from '../../../Wrapper';

const a11yText = consts.a11yLabel;

/* eslint-disable complexity */
/* NOTE: we need to check a lot for presence, so this is that complex */
export const PollDetail = ({ data, refetch, route, navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState();

  const {
    comments,
    commentsCount,
    description,
    endsAt,
    id,
    questions,
    summary,
    title,
    token
  } = data.poll;

  const endsDate = new Date(endsAt).getTime();
  const currentDate = new Date().getTime();

  useEffect(() => {
    getConsulUser().then((userInfo) => {
      if (userInfo) return setUserId(JSON.parse(userInfo).id);
    });
  }, []);

  const openWebScreen = useOpenWebScreen(
    route.params?.title ?? '',
    undefined,
    route.params?.rootRouteName
  );

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      comment: null
    }
  });

  const [addCommentToPoll] = useMutation(ADD_COMMENT_TO_POLLS, {
    client: ConsulClient
  });

  const onSubmit = async (commentData) => {
    if (!commentData?.comment) return;

    try {
      await addCommentToPoll({ variables: { pollId: id, body: commentData.comment } });
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

        {!!summary && <ConsulSummary summary={summary} />}

        {!!description && (
          <Wrapper>
            <HtmlView html={description} openWebScreen={openWebScreen} />
          </Wrapper>
        )}

        {!!questions && (
          <ConsulQuestionsList
            data={questions}
            refetch={refetch}
            token={token}
            disabled={endsDate >= currentDate}
          />
        )}

        {!!comments && (
          <ConsulCommentList
            commentCount={commentsCount}
            commentsData={comments}
            userId={userId}
            refetch={refetch}
            navigation={navigation}
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

PollDetail.propTypes = {
  data: PropTypes.object.isRequired,
  navigation: PropTypes.object.isRequired,
  refetch: PropTypes.func,
  route: PropTypes.object
};
