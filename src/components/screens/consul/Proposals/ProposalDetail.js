import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useMutation } from 'react-apollo';
import { useForm } from 'react-hook-form';
import { StyleSheet } from 'react-native';

import { colors, consts, device, texts } from '../../../../config';
import { ConsulClient } from '../../../../ConsulClient';
import { getConsulUser } from '../../../../helpers';
import { useOpenWebScreen } from '../../../../hooks';
import { location, locationIconAnchor } from '../../../../icons';
import { ADD_COMMENT_TO_PROPOSAL, PUBLISH_PROPOSAL } from '../../../../queries/consul';
import { QUERY_TYPES } from '../../../../queries';
import { ScreenName } from '../../../../types';
import { Button } from '../../../Button';
import {
  ConsulCommentList,
  ConsulDocumentList,
  ConsulExternalVideoComponent,
  ConsulPublicAuthor,
  ConsulSummaryComponent,
  ConsulSupportingComponent,
  ConsulTagList,
  ConsulVideoComponent
} from '../../../consul';
import { HtmlView } from '../../../HtmlView';
import { Image } from '../../../Image';
import { WebViewMap } from '../../../map';
import { SafeAreaViewFlex } from '../../../SafeAreaViewFlex';
import { BoldText, RegularText } from '../../../Text';
import { Title, TitleContainer, TitleShadow } from '../../../Title';
import { Wrapper, WrapperVertical, WrapperWithOrientation } from '../../../Wrapper';
import { Input } from '../../../form';

const a11yText = consts.a11yLabel;

/* eslint-disable complexity */
/* NOTE: we need to check a lot for presence, so this is that complex */
export const ProposalDetail = ({ data, onRefresh, route, navigation }) => {
  const [loading, setLoading] = useState();
  const [userId, setUserId] = useState();

  const {
    cachedVotesUp,
    comments,
    commentsCount,
    currentUserHasVoted,
    description,
    documents,
    id,
    imageUrlMedium,
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
    getConsulUser().then((val) => {
      if (val) return setUserId(JSON.parse(val).id);
    });
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

    setLoading(true);

    try {
      await addCommentToProposal({ variables: { proposalId: id, body: commentData.comment } });
      onRefresh();
      setLoading(false);
      reset();
    } catch (err) {
      console.error(err);
    }
  };

  const proposalShare = async () => {
    setLoading(true);

    await publishProposal({ variables: { id: id } })
      .then(() => {
        onRefresh();
        setLoading(false);
      })
      .catch((err) => console.error(err));
  };

  return (
    <SafeAreaViewFlex>
      <WrapperWithOrientation>
        {!published && (
          <Wrapper>
            <BoldText big>{texts.consul.publishProposalBold}</BoldText>
            <RegularText>{texts.consul.publishProposalRegular}</RegularText>
            <Button title={texts.consul.publishProposalButton} onPress={() => proposalShare()} />
          </Wrapper>
        )}

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
                navigation.push(ScreenName.ConsulStartNewScreen, {
                  title: texts.consul.startNew.updateButtonLabel,
                  query: QUERY_TYPES.CONSUL.UPDATE_PROPOSAL,
                  data: {
                    title,
                    tagList: tags.nodes.map((item) => item.name),
                    description,
                    termsOfService: true,
                    summary,
                    videoUrl,
                    id
                  }
                });
              }}
            />
          </Wrapper>
        )}

        {!!imageUrlMedium && (
          <Image source={{ uri: imageUrlMedium }} containerStyle={styles.imageContainerStyle} />
        )}

        {!!summary && <ConsulSummaryComponent summary={summary} />}

        {!!videoUrl && <ConsulVideoComponent videoUrl={videoUrl} />}

        {!!videoUrl && <ConsulExternalVideoComponent videoUrl={videoUrl} />}

        {!!description && (
          <Wrapper>
            <HtmlView html={description} openWebScreen={openWebScreen} />
          </Wrapper>
        )}

        {!!latitude && !!longitude && (
          <>
            <TitleContainer>
              <Title accessibilityLabel={`(${texts.consul.locationTitle}) ${a11yText.heading}`}>
                {texts.consul.locationTitle}
              </Title>
            </TitleContainer>
            <WebViewMap
              locations={[
                {
                  icon: location(colors.primary),
                  iconAnchor: locationIconAnchor,
                  position: { lat: latitude, lng: longitude }
                }
              ]}
              zoom={14}
            />
          </>
        )}

        {!!documents && !!documents.length > 0 && <ConsulDocumentList documents={documents} />}

        {!!tags && tags.nodes.length > 0 && <ConsulTagList tags={tags.nodes} title={true} />}

        <ConsulSupportingComponent
          votesData={{
            onRefresh: onRefresh,
            cachedVotesUp: cachedVotesUp,
            id: id,
            currentUserHasVoted: currentUserHasVoted
          }}
        />

        {!!comments && (
          <ConsulCommentList
            commentCount={commentsCount}
            commentsData={comments.nodes}
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

ProposalDetail.propTypes = {
  data: PropTypes.object.isRequired,
  navigation: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired,
  onRefresh: PropTypes.func,
  route: PropTypes.object
};

const styles = StyleSheet.create({
  imageContainerStyle: { alignSelf: 'center' }
});
