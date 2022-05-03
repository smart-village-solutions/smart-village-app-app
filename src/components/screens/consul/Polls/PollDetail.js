import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useMutation } from 'react-apollo';
import { useForm } from 'react-hook-form';
import { StyleSheet, TouchableOpacity, Keyboard } from 'react-native';

import { colors, consts, device, Icon, normalize, texts } from '../../../../config';
import { ConsulClient } from '../../../../ConsulClient';
import { getConsulUser } from '../../../../helpers';
import { useOpenWebScreen } from '../../../../hooks';
import { ADD_COMMENT_TO_POLLS } from '../../../../queries/consul';
import { ConsulCommentList, ConsulQuestionsList, ConsulSummaryComponent } from '../../../consul';
import { Input } from '../../../form';
import { HtmlView } from '../../../HtmlView';
import { Title, TitleContainer, TitleShadow } from '../../../Title';
import { Wrapper, WrapperRow } from '../../../Wrapper';

const a11yText = consts.a11yLabel;

/* eslint-disable complexity */
/* NOTE: we need to check a lot for presence, so this is that complex */
export const PollDetail = ({ data, onRefresh, route, navigation }) => {
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
  } = data.poll;

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

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      comment: ''
    }
  });

  const [addCommentToPoll] = useMutation(ADD_COMMENT_TO_POLLS, {
    client: ConsulClient
  });

  const onSubmit = async (commentData) => {
    if (!commentData?.comment) return;

    try {
      await addCommentToPoll({ variables: { pollId: id, body: commentData.comment } });
      onRefresh();
      setLoading(false);
      reset();
      Keyboard.dismiss();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
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

      <Wrapper style={styles.input}>
        <WrapperRow>
          <Input
            multiline
            minHeight={50}
            name="comment"
            label={texts.consul.commentLabel}
            placeholder={texts.consul.comment}
            autoCapitalize="none"
            control={control}
            chat
          />
          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            style={styles.button}
            disabled={loading}
          >
            <Icon.Send color={colors.primary} size={normalize(16)} />
          </TouchableOpacity>
        </WrapperRow>
      </Wrapper>
    </>
  );
};
/* eslint-enable complexity */

PollDetail.propTypes = {
  data: PropTypes.object.isRequired,
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired
  }).isRequired,
  onRefresh: PropTypes.func,
  route: PropTypes.object
};

const styles = StyleSheet.create({
  button: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
    marginBottom: normalize(10),
    width: '10%'
  },
  input: {
    shadowColor: colors.shadow,
    shadowOpacity: 0.7,
    shadowRadius: 3,
    backgroundColor: colors.lightestText
  }
});
