import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useMutation } from 'react-apollo';
import { useForm } from 'react-hook-form';

import { consts, device, texts } from '../../../../config';
import { ConsulClient } from '../../../../ConsulClient';
import { getConsulUser } from '../../../../helpers';
import { useOpenWebScreen } from '../../../../hooks';
import { ADD_COMMENT_TO_POLLS } from '../../../../queries/Consul';
import { Button } from '../../../Button';
import {
  ConsulCommentList,
  ConsulQuestionsList,
  ConsulSummaryComponent,
  Input
} from '../../../Consul';
import { HtmlView } from '../../../HtmlView';
import { SafeAreaViewFlex } from '../../../SafeAreaViewFlex';
import { Title, TitleContainer, TitleShadow } from '../../../Title';
import { Wrapper, WrapperVertical, WrapperWithOrientation } from '../../../Wrapper';

const a11yText = consts.a11yLabel;

/* eslint-disable complexity */
/* NOTE: we need to check a lot for presence, so this is that complex */
export const PollDetail = ({ listData, onRefresh, route, navigation }) => {
  const [loading, setLoading] = useState();
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

    try {
      await addCommentToPoll({ variables: { pollId: id, body: val.comment } });
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

        {!!summary && <ConsulSummaryComponent summary={summary} />}

        {!!description && (
          <Wrapper>
            <HtmlView html={description} openWebScreen={openWebScreen} />
          </Wrapper>
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
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired
  }).isRequired,
  onRefresh: PropTypes.func,
  route: PropTypes.object
};
