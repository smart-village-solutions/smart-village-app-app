import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useMutation } from 'react-apollo';
import { useForm } from 'react-hook-form';
import { Keyboard, StyleSheet, TouchableOpacity } from 'react-native';

import { colors, consts, Icon, normalize, texts } from '../../../../config';
import { ConsulClient } from '../../../../ConsulClient';
import { getConsulUser } from '../../../../helpers';
import { useOpenWebScreen } from '../../../../hooks';
import { QUERY_TYPES } from '../../../../queries';
import { ADD_COMMENT_TO_PROPOSAL, PUBLISH_PROPOSAL } from '../../../../queries/consul';
import { ScreenName } from '../../../../types';
import { Button } from '../../../Button';
import {
  ConsulCommentList,
  ConsulDocumentList,
  ConsulExternalVideo,
  ConsulPublicAuthor,
  ConsulSummary,
  ConsulSupporting,
  ConsulTagList,
  ConsulVideo
} from '../../../consul';
import { Input } from '../../../form';
import { HtmlView } from '../../../HtmlView';
import { Image } from '../../../Image';
import { MapLibre } from '../../../map';
import { SectionHeader } from '../../../SectionHeader';
import { BoldText, RegularText } from '../../../Text';
import { Wrapper, WrapperRow } from '../../../Wrapper';

const { MAP } = consts;

/* eslint-disable complexity */
/* NOTE: we need to check a lot for presence, so this is that complex */
export const ProposalDetail = ({ data, refetch, route, navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState();

  const {
    cachedVotesUp,
    comments,
    commentsCount,
    currentUserHasVoted,
    description,
    documents,
    id,
    image,
    mapLocation,
    publicAuthor,
    publicCreatedAt,
    published,
    summary,
    tags,
    title,
    videoUrl
  } = data.proposal;

  const latitude = mapLocation?.latitude;
  const longitude = mapLocation?.longitude;

  const openWebScreen = useOpenWebScreen(
    route.params?.title ?? '',
    undefined,
    route.params?.rootRouteName
  );

  useEffect(() => {
    getConsulUser().then(setUserId);
  }, []);

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      comment: ''
    }
  });

  const [addCommentToProposal] = useMutation(ADD_COMMENT_TO_PROPOSAL, {
    client: ConsulClient
  });
  const [publishProposal] = useMutation(PUBLISH_PROPOSAL, {
    client: ConsulClient
  });

  const onSubmit = async (commentData) => {
    if (!commentData?.comment) return;

    setIsLoading(true);

    try {
      await addCommentToProposal({ variables: { proposalId: id, body: commentData.comment } });
      refetch();
      setIsLoading(false);
      reset();
      Keyboard.dismiss();
    } catch (err) {
      console.error(err);
    }
  };

  const proposalShare = async () => {
    setIsLoading(true);

    await publishProposal({ variables: { id: id } })
      .then(() => {
        refetch();
        setIsLoading(false);
      })
      .catch((err) => console.error(err));
  };

  return (
    <>
      {!published && publicAuthor?.id === userId && (
        <Wrapper>
          <BoldText big>{texts.consul.publishProposalBold}</BoldText>
          <RegularText>{texts.consul.publishProposalRegular}</RegularText>
          <Button title={texts.consul.publishProposalButton} onPress={() => proposalShare()} />
        </Wrapper>
      )}
      <SectionHeader title={title} />
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
              navigation.push(ScreenName.ConsulStartNewScreen, {
                title: texts.consul.startNew.updateButtonLabel,
                query: QUERY_TYPES.CONSUL.UPDATE_PROPOSAL,
                data: {
                  description,
                  documents,
                  id,
                  image: image?.imageUrlLarge,
                  imageId: image?.id,
                  summary,
                  tagList: tags.nodes.map((item) => item.name),
                  termsOfService: true,
                  title,
                  videoUrl
                }
              });
            }}
          />
        </Wrapper>
      )}

      {!!image?.imageUrlLarge && (
        <Image source={{ uri: image?.imageUrlLarge }} containerStyle={styles.imageContainerStyle} />
      )}

      {!!summary && <ConsulSummary summary={summary} />}

      {!!videoUrl && <ConsulVideo videoUrl={videoUrl} />}

      {!!videoUrl && <ConsulExternalVideo videoUrl={videoUrl} />}

      {!!description && (
        <Wrapper>
          <HtmlView html={description} openWebScreen={openWebScreen} />
        </Wrapper>
      )}

      {!!latitude && !!longitude && (
        <>
          <SectionHeader title={texts.consul.locationTitle} />
          <MapLibre
            locations={[
              {
                iconName: MAP.DEFAULT_PIN,
                position: { latitude, longitude }
              }
            ]}
            mapStyle={styles.mapStyle}
          />
        </>
      )}

      {!!documents && !!documents.length > 0 && <ConsulDocumentList documents={documents} />}

      {!!tags && tags.nodes.length > 0 && <ConsulTagList tags={tags.nodes} title={true} />}

      <ConsulSupporting
        votesData={{
          refetch,
          cachedVotesUp,
          id,
          currentUserHasVoted
        }}
      />

      {!!comments && (
        <ConsulCommentList
          commentCount={commentsCount}
          commentsData={comments.nodes}
          userId={userId}
          refetch={refetch}
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
  imageContainerStyle: {
    alignSelf: 'center'
  },
  input: {
    shadowColor: colors.shadow,
    shadowOpacity: 0.7,
    shadowRadius: 3,
    backgroundColor: colors.surface
  },
  mapStyle: {
    height: normalize(300),
    width: '100%'
  }
});

ProposalDetail.propTypes = {
  data: PropTypes.object.isRequired,
  navigation: PropTypes.object.isRequired,
  refetch: PropTypes.func,
  route: PropTypes.object
};
