import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-apollo';

import { SafeAreaViewFlex } from '../../../SafeAreaViewFlex';
import { Title, TitleContainer, TitleShadow } from '../../../Title';
import { Wrapper, WrapperVertical, WrapperWithOrientation } from '../../../Wrapper';
import { Button } from '../../../Button';
import {
  Input,
  ConsulCommentList,
  ConsulQuestionsList,
  ConsulSummaryComponent,
  ConsulDateComponent
} from '../../../Consul';
import { consts, device, texts } from '../../../../config';
import { ConsulClient } from '../../../../ConsulClient';
import { ADD_COMMENT_TO_POLLS } from '../../../../queries/Consul';
import { HtmlView } from '../../../HtmlView';
import { useOpenWebScreen } from '../../../../hooks';
import { getConsulUser } from '../../../../helpers';

const a11yText = consts.a11yLabel;

/* eslint-disable complexity */
/* NOTE: we need to check a lot for presence, so this is that complex */
export const PollDetail = ({ listData, onRefresh, route }) => {
  const [loading, setLoading] = useState();
  const [userId, setUserId] = useState();

  const {
    comments,
    commentsCount,
    description,
    endsAt,
    id,
    questions,
    startsAt,
    summary,
    title,
    token
  } = listData.poll;

  const endsDate = new Date(endsAt).getTime();
  const currentDate = new Date().getTime();

  useEffect(() => {
    getConsulUser().then((val) => {
      if (val) return setUserId(JSON.parse(val).id);
    });
  }, []);

  const openWebScreen = useOpenWebScreen(
    route.params?.title ?? '',
    undefined,
    route.params?.rootRouteName
  );

  const { control, handleSubmit, reset } = useForm();

  const [addCommentToPoll] = useMutation(ADD_COMMENT_TO_POLLS, {
    client: ConsulClient
  });

  const onSubmit = async (val) => {
    setLoading(true);
    await addCommentToPoll({ variables: { pollId: id, body: val.comment } })
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
        {!!title && (
          <>
            <TitleContainer>
              <Title accessibilityLabel={`(${title}) ${a11yText.heading}`}>{title}</Title>
            </TitleContainer>
            {device.platform === 'ios' && <TitleShadow />}
          </>
        )}

        {!!summary && <ConsulSummaryComponent summary={summary} />}

        {!!description && (
          <Wrapper>
            <HtmlView html={description} openWebScreen={openWebScreen} />
          </Wrapper>
        )}

        {!!startsAt && !!endsAt && endsDate >= currentDate && (
          <ConsulDateComponent startsAt={startsAt} endsAt={endsAt} />
        )}

        {!!questions && (
          <ConsulQuestionsList
            data={questions}
            onRefresh={onRefresh}
            token={token}
            disabled={endsDate >= currentDate}
          />
        )}

        {!!comments && (
          <ConsulCommentList
            commentCount={commentsCount}
            commentsData={comments}
            userId={userId}
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

PollDetail.propTypes = {
  listData: PropTypes.object.isRequired,
  onRefresh: PropTypes.func,
  route: PropTypes.object
};
