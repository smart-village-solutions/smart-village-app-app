import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-apollo';

import { SafeAreaViewFlex } from '../../../SafeAreaViewFlex';
import { Title, TitleContainer, TitleShadow } from '../../../Title';
import { Wrapper, WrapperWithOrientation } from '../../../Wrapper';
import { HtmlView } from '../../../HtmlView';
import { Button } from '../../../Button';
import {
  ConsulCommentList,
  ConsulTagList,
  ConsulSupportingComponent,
  ConsulPublicAuthorComponent,
  ConsulSummaryComponent,
  Input,
  ConsulStartNewButton,
  ConsulExternalVideoComponent
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

const text = texts.consul;
const a11yText = consts.a11yLabel;

/* eslint-disable complexity */
/* NOTE: we need to check a lot for presence, so this is that complex */
export const ProposalDetail = ({ listData, onRefresh, route, navigation }) => {
  const [loading, setLoading] = useState();
  const [publishedProposal, setPublishedProposal] = useState(
    route.params?.publishedProposal ?? true
  );
  const [userId, setUserId] = useState();

  const {
    cachedVotesUp,
    comments,
    commentsCount,
    summary,
    description,
    id,
    publicAuthor,
    publicCreatedAt,
    tags,
    title,
    videoUrl,
    currentUserHasVoted,
    mapLocation
  } = listData.proposal;

  const latitude = mapLocation?.latitude;
  const longitude = mapLocation?.longitude;

  const openWebScreen = useOpenWebScreen(
    route.params?.title ?? '',
    undefined,
    route.params?.rootRouteName
  );

  // GET User ID
  getConsulUser().then((val) => setUserId(JSON.parse(val).id));

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
        setPublishedProposal(true);
        onRefresh();
        setLoading(false);
      })
      .catch((err) => console.error(err));
  };

  return (
    <SafeAreaViewFlex>
      <WrapperWithOrientation>
        {/* Publish Proposal! */}
        {!publishedProposal && (
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

        {/* Summary! */}
        {!!summary && <ConsulSummaryComponent summary={summary} />}

        {/* Description! */}
        {!!description && (
          <Wrapper>
            <HtmlView html={description} openWebScreen={openWebScreen} />
          </Wrapper>
        )}

        {/* External Video */}
        {!!videoUrl && <ConsulExternalVideoComponent videoUrl={videoUrl} />}

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
        {/*TODO: Mutation funksionert nicht*/}
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
