import PropTypes from 'prop-types';
import React, { useState } from 'react';
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

const text = texts.consul;
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

  const endsDate = new Date(endsAt).toDateString();
  const currentDate = new Date().toDateString();

  // GET User ID
  getConsulUser().then((val) => setUserId(JSON.parse(val).id));

  const openWebScreen = useOpenWebScreen(
    route.params?.title ?? '',
    undefined,
    route.params?.rootRouteName
  );

  // React Hook Form
  const { control, handleSubmit, reset } = useForm();

  // GraphQL
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
        {/* Title! */}
        {!!title && (
          <>
            <TitleContainer>
              <Title accessibilityLabel={`(${title}) ${a11yText.heading}`}>{title}</Title>
            </TitleContainer>
            {device.platform === 'ios' && <TitleShadow />}
          </>
        )}

        {/* Summary! */}
        {!!summary && <ConsulSummaryComponent summary={summary} />}

        {/* Description! */}
        {!!description && (
          <Wrapper>
            <HtmlView html={description} openWebScreen={openWebScreen} />
          </Wrapper>
        )}

        {/* Question! */}
        {!!questions && (
          <ConsulQuestionsList
            data={questions}
            onRefresh={onRefresh}
            token={token}
            disabled={endsDate >= currentDate}
          />
        )}

        {!!startsAt && endsAt && <ConsulDateComponent startsAt={startsAt} endsAt={endsAt} />}

        {/* Comments List! */}
        {!!comments && (
          <ConsulCommentList
            commentCount={commentsCount}
            commentsData={comments}
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

PollDetail.propTypes = {
  listData: PropTypes.object.isRequired,
  onRefresh: PropTypes.func,
  route: PropTypes.object
};
