import React from 'react';
import { View } from 'react-native';

import { texts } from '../../config';
import {
  getGenericItemMatomoName,
  matomoTrackingString,
  momentFormat,
  trimNewLines
} from '../../helpers';
import { useMatomoTrackScreenView, useOpenWebScreen } from '../../hooks';
import { GenericItem, GenericType } from '../../types';
import { DataProviderButton } from '../DataProviderButton';
import { HtmlView } from '../HtmlView';
import { ImageSection } from '../ImageSection';
import { SectionHeader } from '../SectionHeader';
import { StorySection } from '../StorySection';
import { BoldText, RegularText } from '../Text';
import { Button } from '../Button';
import { Wrapper, WrapperHorizontal, WrapperRow } from '../Wrapper';

type ParticipationProject = GenericItem & {
  description?: string;
  teaser?: string;
  updatedAt?: string;
};

type Props = {
  data: ParticipationProject;
  readAloudControls?: React.ReactNode;
  route: {
    params?: {
      rootRouteName?: string;
      title?: string;
    };
  };
};

const isImage = (mediaContent: { contentType?: string }) => mediaContent.contentType === 'image';

type MetaProps = Pick<
  ParticipationProject,
  'createdAt' | 'dataProvider' | 'publicationDate' | 'updatedAt'
>;

const ParticipationProjectMeta = ({
  createdAt,
  dataProvider,
  publicationDate,
  updatedAt
}: MetaProps) => {
  const displayDate = publicationDate || createdAt;

  return (
    <>
      {!!dataProvider?.name && (
        <Wrapper>
          <WrapperRow>
            <BoldText>{texts.dataProvider.partner}: </BoldText>
            <RegularText>{dataProvider.name}</RegularText>
          </WrapperRow>
        </Wrapper>
      )}

      {!!displayDate && (
        <Wrapper noPaddingTop>
          <WrapperRow>
            <BoldText>{texts.participationProject.publishedAt}: </BoldText>
            <RegularText>{momentFormat(displayDate)}</RegularText>
          </WrapperRow>
        </Wrapper>
      )}

      {!!updatedAt && updatedAt !== displayDate && (
        <Wrapper noPaddingTop>
          <WrapperRow>
            <BoldText>{texts.participationProject.updatedAt}: </BoldText>
            <RegularText>{momentFormat(updatedAt)}</RegularText>
          </WrapperRow>
        </Wrapper>
      )}
    </>
  );
};

const ParticipationProjectText = ({
  description,
  openWebScreen,
  teaser
}: Pick<ParticipationProject, 'description' | 'teaser'> & {
  openWebScreen: (url?: string) => void;
}) => (
  <>
    {!!teaser && (
      <WrapperHorizontal>
        <RegularText>{trimNewLines(teaser)}</RegularText>
      </WrapperHorizontal>
    )}

    {!!description && (
      <WrapperHorizontal>
        <HtmlView html={trimNewLines(description)} openWebScreen={openWebScreen} selectable />
      </WrapperHorizontal>
    )}
  </>
);

const ParticipationProjectLink = ({
  description,
  link,
  openWebScreen
}: {
  description?: string;
  link?: string;
  openWebScreen: (url?: string) => void;
}) => {
  if (!link) return null;

  return (
    <Wrapper>
      <Button
        title={description || texts.participationProject.openProject}
        onPress={() => openWebScreen(link)}
      />
    </Wrapper>
  );
};

export const ParticipationProjectDetail = ({ data, readAloudControls, route }: Props) => {
  const {
    contentBlocks,
    createdAt,
    dataProvider,
    description,
    genericType,
    mediaContents,
    publicationDate,
    teaser,
    title,
    updatedAt,
    webUrls
  } = data;
  const link = webUrls?.[0]?.url;
  const imageMediaContents = mediaContents?.filter(isImage) || [];
  const rootRouteName = route.params?.rootRouteName ?? '';
  const headerTitle = route.params?.title ?? texts.participationProject.participationProject;
  const openWebScreen = useOpenWebScreen(headerTitle, link, rootRouteName);
  const hasContent = !!description || !!teaser || !!contentBlocks?.length || !!link;

  useMatomoTrackScreenView(
    matomoTrackingString([
      getGenericItemMatomoName(genericType as GenericType),
      dataProvider?.name,
      title
    ])
  );

  return (
    <View>
      {!!imageMediaContents.length && <ImageSection mediaContents={imageMediaContents} />}
      {readAloudControls}

      {!!title && <SectionHeader title={title} />}

      <ParticipationProjectMeta
        createdAt={createdAt}
        dataProvider={dataProvider}
        publicationDate={publicationDate}
        updatedAt={updatedAt}
      />
      <ParticipationProjectText
        description={description}
        openWebScreen={openWebScreen}
        teaser={teaser}
      />

      {contentBlocks?.map((contentBlock, index) => (
        <StorySection
          contentBlock={contentBlock}
          index={index}
          key={`${contentBlock.id}-${index}`}
          openWebScreen={openWebScreen}
        />
      ))}

      <ParticipationProjectLink
        description={webUrls?.[0]?.description}
        link={link}
        openWebScreen={openWebScreen}
      />

      {!hasContent && (
        <Wrapper>
          <RegularText>{texts.participationProject.empty}</RegularText>
        </Wrapper>
      )}

      {!!dataProvider?.name && (
        <DataProviderButton dataProvider={{ ...dataProvider, name: dataProvider.name }} />
      )}
    </View>
  );
};
