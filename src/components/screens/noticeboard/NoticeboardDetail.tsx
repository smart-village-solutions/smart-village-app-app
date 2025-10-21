import { useFocusEffect } from '@react-navigation/native';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useLayoutEffect } from 'react';
import { useMutation, useQuery } from 'react-apollo';
import { Alert, StyleSheet, View } from 'react-native';

import { useProfileContext } from '../../../ProfileProvider';
import { colors, Icon, normalize, texts } from '../../../config';
import {
  filterGenericItems,
  getGenericItemMatomoName,
  matomoTrackingString,
  trimNewLines
} from '../../../helpers';
import { useMatomoTrackScreenView, useOpenWebScreen } from '../../../hooks';
import { getQuery, QUERY_TYPES } from '../../../queries';
import { DELETE_GENERIC_ITEM } from '../../../queries/genericItem';
import { ScreenName } from '../../../types';
import { Button } from '../../Button';
import { HtmlView } from '../../HtmlView';
import { ImageSection } from '../../ImageSection';
import { LoadingSpinner } from '../../LoadingSpinner';
import { SectionHeader } from '../../SectionHeader';
import { StorySection } from '../../StorySection';
import { BoldText, HeadlineText, RegularText } from '../../Text';
import { TextListItem } from '../../TextListItem';
import { Wrapper, WrapperHorizontal, WrapperRow, WrapperVertical } from '../../Wrapper';
import { InfoCard } from '../../infoCard';
import { VolunteerAvatar } from '../../volunteer';

const isImage = (mediaContent) => mediaContent.contentType === 'image';

/* eslint-disable complexity */
export const NoticeboardDetail = ({ data, navigation, fetchPolicy, refetch, route }) => {
  const {
    id,
    categories,
    contacts,
    contentBlocks,
    dataProvider,
    dates,
    genericType,
    mediaContents,
    memberId,
    payload,
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
  const subQuery = route.params?.subQuery ?? {};
  const isCarpool = (subQuery?.params?.isCarpool || payload?.departureDate) ?? false;
  const toRelated = route.params?.toRelated ?? false;

  // action to open source urls
  const openWebScreen = useOpenWebScreen(headerTitle, link, rootRouteName);

  const { currentUserData, isLoading, isLoggedIn } = useProfileContext();
  const currentUserMemberId = currentUserData?.member?.id;
  const isCurrentUser = !!currentUserMemberId && !!memberId && currentUserMemberId == memberId;

  const [deleteEntry] = useMutation(DELETE_GENERIC_ITEM, {
    variables: { id },
    onCompleted: () => navigation.goBack()
  });

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

  const { data: conversationsData, refetch: conversationsRefetch } = useQuery(
    getQuery(QUERY_TYPES.PROFILE.GET_CONVERSATIONS),
    {
      variables: {
        conversationableId: id,
        conversationableType: 'GenericItem'
      }
    }
  );

  const conversations = conversationsData?.[QUERY_TYPES.PROFILE.GET_CONVERSATIONS];

  useEffect(() => {
    refetchMemberIndex();
  }, [data]);

  useFocusEffect(
    useCallback(() => {
      refetch();
      conversationsRefetch();
    }, [])
  );

  useLayoutEffect(() => {
    isCurrentUser &&
      navigation.setOptions({
        headerTitle: () => <HeadlineText lightest>{texts.noticeboard.myNoticeboard}</HeadlineText>
      });
  }, [isCurrentUser]);

  if (isLoading) {
    return <LoadingSpinner loading />;
  }

  return (
    <View>
      <WrapperVertical style={styles.noPaddingTop}>
        <ImageSection mediaContents={mediaContents?.filter(isImage)} />
      </WrapperVertical>

      {isCurrentUser && (
        <Wrapper>
          <WrapperRow spaceAround>
            <Button
              icon={<Icon.Pencil color={colors.lightestText} />}
              iconPosition="left"
              notFullWidth
              title={texts.noticeboard.edit}
              onPress={() =>
                navigation.push(ScreenName.NoticeboardForm, {
                  consentForDataProcessingText: subQuery?.params?.consentForDataProcessingText,
                  isLoginRequired: toRelated || isLoggedIn,
                  details: data,
                  genericType,
                  isNewEntryForm: true,
                  name: subQuery?.params?.editName,
                  requestedDateDifference: subQuery?.params?.requestedDateDifference,
                  title: subQuery?.params?.editTitle
                })
              }
            />
            <Button
              icon={<Icon.Trash />}
              iconPosition="left"
              invert
              notFullWidth
              title={texts.noticeboard.delete}
              onPress={() =>
                Alert.alert(texts.noticeboard.alerts.hint, texts.noticeboard.alerts.delete, [
                  {
                    text: texts.noticeboard.abort,
                    onPress: () => null,
                    style: 'cancel'
                  },
                  {
                    text: texts.noticeboard.delete,
                    onPress: () => deleteEntry(),
                    style: 'destructive'
                  }
                ])
              }
            />
          </WrapperRow>
        </Wrapper>
      )}

      {isCurrentUser && !!categories?.length && !!categories[0].name && (
        <WrapperHorizontal>
          <HeadlineText smaller uppercase>
            {categories[0].name}
          </HeadlineText>
        </WrapperHorizontal>
      )}

      {!!title && <SectionHeader big title={title} />}

      {!!priceInformations?.length && !!priceInformations[0].description.length && (
        <WrapperHorizontal>
          <BoldText>Preis: {priceInformations[0].description}</BoldText>
        </WrapperHorizontal>
      )}

      {!!contentBlocks?.length && (
        <>
          <SectionHeader title={texts.noticeboard.description} containerStyle={styles.paddingTop} />
          <>
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
          </>
        </>
      )}

      {isCarpool && (
        <>
          <Wrapper>
            {!!payload?.departureDate && (
              <WrapperRow>
                <BoldText>{texts.noticeboard.inputDepartureDate}: </BoldText>
                <RegularText>{payload.departureDate}</RegularText>
              </WrapperRow>
            )}
            {!!payload?.departureTime && (
              <WrapperRow>
                <BoldText>{texts.noticeboard.inputDepartureTime}: </BoldText>
                <RegularText>{payload.departureTime} Uhr</RegularText>
              </WrapperRow>
            )}
            {payload?.departureAddress ? (
              <WrapperRow>
                <BoldText>{texts.noticeboard.inputDepartureAddress}: </BoldText>
                <RegularText>{payload.departureAddress}</RegularText>
              </WrapperRow>
            ) : (
              <WrapperRow>
                <BoldText>{texts.noticeboard.inputDepartureAddress}: </BoldText>
                <RegularText>
                  {[
                    payload?.departureStreet,
                    [payload?.departureZip, payload?.departureCity].filter(Boolean).join(' ')
                  ]
                    .filter(Boolean)
                    .join(', ')}
                </RegularText>
              </WrapperRow>
            )}
            {payload?.destinationAddress ? (
              <WrapperRow>
                <BoldText>{texts.noticeboard.inputDestinationAddress}: </BoldText>
                <RegularText>{payload.destinationAddress}</RegularText>
              </WrapperRow>
            ) : (
              <WrapperRow>
                <BoldText>{texts.noticeboard.inputDestinationAddress}: </BoldText>
                <RegularText>
                  {[
                    payload?.destinationStreet,
                    [payload?.destinationZip, payload?.destinationCity].filter(Boolean).join(' ')
                  ]
                    .filter(Boolean)
                    .join(', ')}
                </RegularText>
              </WrapperRow>
            )}
            {!!payload?.drivingFrequency && (
              <WrapperRow>
                <BoldText>{texts.noticeboard.drivingFrequency}: </BoldText>
                <RegularText>
                  {texts.noticeboard.carpoolFrequency[payload.drivingFrequency]}
                </RegularText>
              </WrapperRow>
            )}
            {!!payload?.drivingFrequencyDays?.length && (
              <WrapperRow>
                <BoldText>{texts.noticeboard.drivingDays}: </BoldText>
                <RegularText>
                  {payload.drivingFrequencyDays
                    .map((day) => texts.noticeboard.weekday[day])
                    .join(', ')}
                </RegularText>
              </WrapperRow>
            )}
            {!!payload?.availablePlaces && (
              <WrapperRow>
                <BoldText>{texts.noticeboard.inputAvailablePlaces}: </BoldText>
                <RegularText>{payload.availablePlaces}</RegularText>
              </WrapperRow>
            )}
            {!!payload?.licensePlate && (
              <WrapperRow>
                <BoldText>{texts.noticeboard.inputLicensePlate}: </BoldText>
                <RegularText>{payload.licensePlate}</RegularText>
              </WrapperRow>
            )}
            {!!payload?.carBrand && (
              <WrapperRow>
                <BoldText>{texts.noticeboard.inputCarBrand}: </BoldText>
                <RegularText>{payload.carBrand}</RegularText>
              </WrapperRow>
            )}
            {!!payload?.carColor && (
              <WrapperRow>
                <BoldText>{texts.noticeboard.inputCarColor}: </BoldText>
                <RegularText>{payload.carColor}</RegularText>
              </WrapperRow>
            )}
            {!!payload?.comments && (
              <>
                <BoldText>{texts.noticeboard.inputComments}: </BoldText>
                <HtmlView
                  html={trimNewLines(payload.comments)}
                  openWebScreen={openWebScreen}
                  selectable
                />
              </>
            )}
          </Wrapper>
        </>
      )}

      {!!dates?.length && (
        <>
          <SectionHeader title={texts.noticeboard.duration} containerStyle={styles.paddingTop} />
          <WrapperHorizontal>
            <InfoCard dates={dates} />
          </WrapperHorizontal>
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
                routeName: ScreenName.ProfileUpdate,
                onPress: () =>
                  navigation.push(ScreenName.NoticeboardMemberIndex, {
                    data: dataMemberIndex,
                    isCurrentUser,
                    memberId,
                    memberEmail: contacts[0].email,
                    memberName: contacts[0].firstName,
                    query: QUERY_TYPES.GENERIC_ITEMS,
                    subQuery,
                    title: texts.noticeboard.member
                  }),
                title: contacts[0].firstName
              }}
              navigation={memberEntries ? navigation : undefined}
            />
          </WrapperHorizontal>
        </>
      )}

      {!isCurrentUser && (
        <Wrapper>
          <Button
            icon={<Icon.Mail color={colors.lightestText} />}
            iconPosition="left"
            title={
              toRelated
                ? texts.noticeboard.backToConversation
                : conversations?.[0]?.id
                ? texts.noticeboard.toConversation
                : texts.noticeboard.writeMessage
            }
            onPress={() =>
              navigation.navigate(ScreenName.ProfileMessaging, {
                query: QUERY_TYPES.PROFILE.GET_MESSAGES,
                queryVariables: {
                  category: categories?.[0]?.name,
                  conversationableId: id,
                  conversationableType: 'GenericItem',
                  id: conversations?.[0]?.id,
                  title
                },
                displayName: contacts?.[0]?.firstName,
                title
              })
            }
          />
        </Wrapper>
      )}
    </View>
  );
};
/* eslint-enable complexity */

const styles = StyleSheet.create({
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
