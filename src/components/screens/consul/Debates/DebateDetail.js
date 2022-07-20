import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useMutation } from 'react-apollo';
import { useForm } from 'react-hook-form';
import { StyleSheet, TouchableOpacity, Keyboard } from 'react-native';

import { colors, consts, device, Icon, normalize, texts } from '../../../../config';
import { ConsulClient } from '../../../../ConsulClient';
import { getConsulUser } from '../../../../helpers';
import { useOpenWebScreen } from '../../../../hooks';
import { QUERY_TYPES } from '../../../../queries';
import { ADD_COMMENT_TO_DEBATE } from '../../../../queries/consul';
import { ScreenName } from '../../../../types';
import {
  ConsulCommentList,
  ConsulPublicAuthor,
  ConsulTagList,
  ConsulVoting
} from '../../../consul';
import { Input } from '../../../form';
import { HtmlView } from '../../../HtmlView';
import { Title, TitleContainer, TitleShadow } from '../../../Title';
import { Wrapper, WrapperRow } from '../../../Wrapper';

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
      if (userInfo) return setUserId(userInfo);
    });
  }, []);

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      comment: ''
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
            disabled={isLoading}
          >
            <Icon.Mail color={colors.primary} />
          </TouchableOpacity>
        </WrapperRow>
      </Wrapper>
    </>
  );
};
/* eslint-enable complexity */

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
    backgroundColor: colors.surface
  }
});

DebateDetail.propTypes = {
  data: PropTypes.object.isRequired,
  navigation: PropTypes.object.isRequired,
  refetch: PropTypes.func,
  route: PropTypes.object
};
