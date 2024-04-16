import PropTypes from 'prop-types';
import React, { useEffect, useLayoutEffect } from 'react';
import { useQuery } from 'react-apollo';
import { StyleSheet, View } from 'react-native';
import { Badge } from 'react-native-elements';

import { colors, normalize, texts } from '../../../config';
import {
  filterGenericItems,
  getGenericItemMatomoName,
  matomoTrackingString
} from '../../../helpers';
import { useMatomoTrackScreenView, useOpenWebScreen, useProfileUser } from '../../../hooks';
import { QUERY_TYPES, getQuery } from '../../../queries';
import { ScreenName } from '../../../types';
import { ImageSection } from '../../ImageSection';
import { SectionHeader } from '../../SectionHeader';
import { StorySection } from '../../StorySection';
import { BoldText, HeadlineText } from '../../Text';
import { TextListItem } from '../../TextListItem';
import { Wrapper, WrapperHorizontal, WrapperVertical } from '../../Wrapper';
import { InfoCard } from '../../infoCard';
import { VolunteerAvatar } from '../../volunteer';

const isImage = (mediaContent) => mediaContent.contentType === 'image';

// eslint-disable-next-line complexity
export const NoticeboardDetail = ({ data, navigation, fetchPolicy, route }) => {
  const {
    categories,
    contacts,
    contentBlocks,
    dataProvider,
    dates,
    genericType,
    mediaContents,
    memberId,
    priceInformations,
    sourceUrl,
    title
  } = data;

  useMatomoTrackScreenView(
    matomoTrackingString([
      getGenericItemMatomoName(genericType),
      dataProvider && dataProvider.name,
      title
    ])
  );

  const link = sourceUrl?.url;
  const rootRouteName = route.params?.rootRouteName ?? '';
  const headerTitle = route.params?.title ?? '';

  // action to open source urls
  const openWebScreen = useOpenWebScreen(headerTitle, link, rootRouteName);

  const { currentUserData } = useProfileUser();
  const currentUserMemberId = currentUserData?.member?.id;
  const isCurrentUser = !!currentUserMemberId && !!memberId && currentUserMemberId == memberId;

  const { data: dataMemberIndex, refetch: refetchMemberIndex } = useQuery(
    getQuery(QUERY_TYPES.GENERIC_ITEMS),
    {
      fetchPolicy,
      variables: {
        memberId
      },
      skip: !memberId
    }
  );

  const memberEntries =
    dataMemberIndex?.[QUERY_TYPES.GENERIC_ITEMS]?.filter(filterGenericItems)?.length;

  useEffect(() => {
    refetchMemberIndex();
  }, [data]);

  useLayoutEffect(() => {
    isCurrentUser &&
      navigation.setOptions({
        headerTitle: () => <HeadlineText>{texts.noticeboard.myNoticeboard}</HeadlineText>
      });
  }, []);

  return (
    <View>
      <WrapperVertical style={styles.noPaddingTop}>
        <ImageSection mediaContents={mediaContents?.filter(isImage)} />
      </WrapperVertical>

      {/* TODO: show buttons to edit and delete if isCurrentUser */}

      {!!categories?.length && !!categories[0].name && (
        <WrapperHorizontal>
          <HeadlineText smaller uppercase>
            {categories[0].name}
          </HeadlineText>
        </WrapperHorizontal>
      )}

      {!!title && <SectionHeader big title={title} />}

      {!!priceInformations?.length && !!priceInformations[0].description.length && (
        <WrapperHorizontal>
          <BoldText>{priceInformations[0].description}</BoldText>
        </WrapperHorizontal>
      )}

      {!!dates?.length && (
        <>
          <SectionHeader title={texts.noticeboard.details} containerStyle={styles.paddingTop} />
          <Wrapper>
            <InfoCard dates={dates} />
          </Wrapper>
        </>
      )}

      {!!contacts?.length && (
        <>
          <SectionHeader title={texts.noticeboard.member} containerStyle={styles.paddingTop} />
          <WrapperHorizontal>
            <TextListItem
              item={{
                bottomDivider: false,
                leftIcon: (
                  <VolunteerAvatar item={{ user: { display_name: contacts[0].firstName } }} />
                ),
                rightIcon: !!memberEntries && (
                  <Badge
                    value={memberEntries}
                    badgeStyle={styles.badge}
                    textStyle={styles.badgeText}
                  />
                ),
                routeName: ScreenName.ProfileUpdate,
                onPress: () =>
                  navigation.push(ScreenName.NoticeboardMemberIndex, {
                    data: dataMemberIndex,
                    isCurrentUser,
                    memberName: contacts[0].firstName,
                    query: QUERY_TYPES.GENERIC_ITEMS,
                    title: texts.noticeboard.member
                  }),
                title: contacts[0].firstName
              }}
              navigation={!!memberEntries && navigation}
            />
          </WrapperHorizontal>
        </>
      )}

      {!!contentBlocks?.length && (
        <>
          <SectionHeader title={texts.noticeboard.description} containerStyle={styles.paddingTop} />
          <WrapperVertical>
            {contentBlocks?.map((contentBlock, index) => {
              return (
                <StorySection
                  contentBlock={contentBlock}
                  index={index}
                  key={`${contentBlock.id}-${index}`}
                  openWebScreen={openWebScreen}
                />
              );
            })}
          </WrapperVertical>
        </>
      )}

      {/* TODO: show button to message if !isCurrentUser */}
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    backgroundColor: colors.gray20,
    borderWidth: 0,
    borderRadius: normalize(16),
    paddingHorizontal: normalize(8)
  },
  badgeText: {
    color: colors.darkText,
    fontFamily: 'regular',
    fontSize: normalize(11),
    lineHeight: normalize(13)
  },
  noPaddingTop: {
    paddingTop: 0
  },
  paddingTop: {
    paddingTop: normalize(24)
  }
});

NoticeboardDetail.propTypes = {
  data: PropTypes.object.isRequired,
  fetchPolicy: PropTypes.string.isRequired,
  navigation: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired
};
