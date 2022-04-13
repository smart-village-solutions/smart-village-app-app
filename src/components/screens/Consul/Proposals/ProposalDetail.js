import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-apollo';

import { SafeAreaViewFlex } from '../../../SafeAreaViewFlex';
import { Title, TitleContainer, TitleShadow } from '../../../Title';
import { Wrapper, WrapperWithOrientation } from '../../../Wrapper';
import { HtmlView } from '../../../HtmlView';
import { Button } from '../../../Button';
import {
  ConsulCommentList,
  ConsulExternalVideoComponent,
  ConsulPublicAuthorComponent,
  ConsulStartNewButton,
  ConsulSummaryComponent,
  ConsulSupportingComponent,
  ConsulTagList,
  ConsulVideoComponent,
  Input
} from '../../../Consul';
import { colors, consts, device, texts } from '../../../../config';
import { useOpenWebScreen } from '../../../../hooks';
import { ConsulClient } from '../../../../ConsulClient';
import { ADD_COMMENT_TO_PROPOSAL, PUBLISH_PROPOSAL } from '../../../../queries/Consul';
import { QUERY_TYPES } from '../../../../queries';
import { BoldText, RegularText } from '../../../Text';
import { getConsulUser } from '../../../../helpers';
import { WebViewMap } from '../../../map';
import { location, locationIconAnchor } from '../../../../icons';
import { Image } from '../../../Image';
import { ConsulDocumentList } from '../../../Consul/detail/ConsulDocumentList';

const text = texts.consul;
const a11yText = consts.a11yLabel;

/* eslint-disable complexity */
/* NOTE: we need to check a lot for presence, so this is that complex */
export const ProposalDetail = ({ listData, onRefresh, route, navigation }) => {
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
  } = listData.proposal;

  const latitude = mapLocation?.latitude;
  const longitude = mapLocation?.longitude;

  const openWebScreen = useOpenWebScreen(
    route.params?.title ?? '',
    undefined,
    route.params?.rootRouteName
  );

  useEffect(() => {
    // GET User ID
    getConsulUser().then((val) => {
      if (val) return setUserId(JSON.parse(val).id);
    });
  }, []);

  // React Hook Form
  const { control, handleSubmit, reset } = useForm();

  // GraphQL
  const [addCommentToProposal] = useMutation(ADD_COMMENT_TO_PROPOSAL, {
    client: ConsulClient
  });
  const [publishProposal] = useMutation(PUBLISH_PROPOSAL, {
    client: ConsulClient
  });

  const onSubmit = async (val) => {
    setLoading(true);
    await addCommentToProposal({ variables: { proposalId: id, body: val.comment } })
      .then(() => {
        onRefresh();

        setLoading(false);
        reset({ comment: null });
      })
      .catch((err) => console.error(err));
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
        {/* Publish Proposal! */}
        {!published && (
          <Wrapper>
            <BoldText>{text.publishProposalBold}</BoldText>
            <RegularText>{text.publishProposalRegular}</RegularText>
            <Button title={text.publishProposalButton} onPress={() => proposalShare()} />
          </Wrapper>
        )}

        {/* Title! */}
        {!!title && (
          <>
            <TitleContainer>
              <Title accessibilityLabel={`(${title}) ${a11yText.heading}`}>{title}</Title>
            </TitleContainer>
            {device.platform === 'ios' && <TitleShadow />}
          </>
        )}

        {/* Author! */}
        {!!publicAuthor && (
          <ConsulPublicAuthorComponent
            authorData={{
              publicAuthor: publicAuthor,
              commentsCount: commentsCount,
              publicCreatedAt: publicCreatedAt
            }}
          />
        )}

        {/* Image Component */}
        {!!imageUrlMedium && (
          <Image source={{ uri: imageUrlMedium }} containerStyle={styles.imageContainerStyle} />
        )}

        {/* Summary! */}
        {!!summary && <ConsulSummaryComponent summary={summary} />}

        {/* Video Component */}
        {!!videoUrl && <ConsulVideoComponent videoUrl={videoUrl} />}

        {/* Description! */}
        {!!description && (
          <Wrapper>
            <HtmlView html={description} openWebScreen={openWebScreen} />
          </Wrapper>
        )}

        {/* Map View */}
        {!!latitude && !!longitude && (
          <>
            <TitleContainer>
              <Title accessibilityLabel={`(${text.locationTitle}) ${a11yText.heading}`}>
                {text.locationTitle}
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

        {/* External Video */}
        {!!videoUrl && <ConsulExternalVideoComponent videoUrl={videoUrl} />}

        {/* Documents */}
        {!!documents && !!documents.length > 0 && <ConsulDocumentList documents={documents} />}

        {/* Proposal Edit Button */}
        {!!publicAuthor && publicAuthor.id === userId && (
          <ConsulStartNewButton
            data={{
              title: title,
              tagList: tags.nodes.map((item) => item.name),
              description: description,
              termsOfService: true,
              summary: summary,
              videoUrl: videoUrl,
              id: id
            }}
            navigation={navigation}
            title={text.startNew.updateButtonLabel}
            buttonTitle={text.startNew.updateButtonLabel}
            query={QUERY_TYPES.CONSUL.UPDATE_PROPOSAL}
          />
        )}

        {/* Tag List! */}
        {!!tags && tags.nodes.length > 0 && <ConsulTagList tags={tags.nodes} title={true} />}

        {/* Voting Component! */}
        <ConsulSupportingComponent
          votesData={{
            onRefresh: onRefresh,
            cachedVotesUp: cachedVotesUp,
            id: id,
            currentUserHasVoted: currentUserHasVoted
          }}
        />

        {/* Comments List! */}
        {!!comments && (
          <ConsulCommentList
            commentCount={commentsCount}
            commentsData={comments.nodes}
            userId={userId}
            onRefresh={onRefresh}
          />
        )}

        {/* New Comment Input! */}
        <Wrapper>
          <Input
            keyboardType="default"
            textContentType="none"
            autoCompleteType="off"
            multiline
            minHeight={50}
            name="comment"
            label={text.commentLabel}
            placeholder={text.comment}
            autoCapitalize="none"
            rules={{ required: text.commentEmptyError }}
            control={control}
          />
        </Wrapper>
        <Wrapper>
          <Button
            onPress={handleSubmit(onSubmit)}
            title={loading ? text.submittingCommentButton : text.commentAnswerButton}
            disabled={loading}
          />
        </Wrapper>
      </WrapperWithOrientation>
    </SafeAreaViewFlex>
  );
};
/* eslint-enable complexity */

ProposalDetail.propTypes = {
  listData: PropTypes.object.isRequired,
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired
  }).isRequired,
  onRefresh: PropTypes.func,
  route: PropTypes.object
};

const styles = StyleSheet.create({
  imageContainerStyle: { alignSelf: 'center' }
});
