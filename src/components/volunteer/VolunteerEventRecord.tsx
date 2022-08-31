import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useMutation } from 'react-query';

import { colors, consts, device, Icon, normalize, texts } from '../../config';
import { isAttending, momentFormat, openLink, volunteerUserData } from '../../helpers';
import { useOpenWebScreen } from '../../hooks';
import { QUERY_TYPES } from '../../queries';
import { calendarAttend } from '../../queries/volunteer';
import { PARTICIPANT_TYPE, ScreenName } from '../../types';
import { Button } from '../Button';
import { HtmlView } from '../HtmlView';
import { ImageSection } from '../ImageSection';
import { InfoCard } from '../infoCard';
import { ShareHeader } from '../ShareHeader';
import { RegularText } from '../Text';
import { Title, TitleContainer, TitleShadow } from '../Title';
import { Touchable } from '../Touchable';
import { Wrapper, WrapperHorizontal, WrapperRow, WrapperWithOrientation } from '../Wrapper';

import { VolunteerAppointmentsCard } from './VolunteerAppointmentsCard';
import { VolunteerEventAttending } from './VolunteerEventAttending';

const a11yText = consts.a11yLabel;

type File = {
  file_name: string;
  guid: string;
  mime_type: string;
  url: string;
};

const filterForMimeType = (items: File[], mimeType: string) =>
  items.filter((item) => item.mime_type.includes(mimeType));

// eslint-disable-next-line complexity
export const VolunteerEventRecord = ({
  data,
  refetch,
  navigation,
  route
}: { data: any; refetch: () => void } & StackScreenProps<any>) => {
  const {
    id,
    content,
    description,
    location,
    end_datetime: endDatetime,
    participant_info: participantInfo,
    participants,
    start_datetime: startDatetime,
    title,
    webUrls
  } = data;

  const { files, topics } = content || {};
  const mediaContents = files?.length
    ? filterForMimeType(files, 'image')?.map(({ mime_type, url }: File) => ({
        contentType: mime_type.includes('image') ? 'image' : mime_type,
        sourceUrl: { url }
      }))
    : undefined;
  const documents = files?.length ? filterForMimeType(files, 'application') : undefined;
  const category = topics?.length
    ? {
        name: topics.map((topic: { name: string }) => topic.name).join(', ')
      }
    : undefined;

  const address = location?.length ? { city: location } : undefined;
  const { attending } = participants || {};
  const rootRouteName = route.params?.rootRouteName ?? '';
  const headerTitle = route.params?.title ?? '';
  const appointments = [
    {
      dateFrom: momentFormat(startDatetime, 'YYYY-MM-DD'),
      dateTo: momentFormat(endDatetime, 'YYYY-MM-DD'),
      timeFrom: momentFormat(startDatetime, 'HH:mm'),
      timeTo: momentFormat(endDatetime, 'HH:mm')
    }
  ];
  const shareContent = route.params?.shareContent || undefined;

  const [isMe, setIsMe] = useState<boolean>();

  const checkIfMe = useCallback(async () => {
    const { currentUserId } = await volunteerUserData();

    !!currentUserId && setIsMe(currentUserId == content?.metadata?.created_by?.id);
  }, [data]);

  useEffect(() => {
    checkIfMe();
  }, [checkIfMe]);

  useLayoutEffect(() => {
    if (isMe) {
      navigation.setOptions({
        headerRight: () =>
          isMe && (
            <WrapperRow style={styles.headerRight}>
              <TouchableOpacity
                onPress={() =>
                  navigation?.navigate(ScreenName.VolunteerForm, {
                    query: QUERY_TYPES.VOLUNTEER.CALENDAR,
                    calendarData: data,
                    groupId: content?.metadata?.contentcontainer_id
                  })
                }
              >
                <Icon.NamedIcon name="settings" color="white" style={styles.icon} />
              </TouchableOpacity>

              <ShareHeader
                shareContent={shareContent}
                style={{ paddingHorizontal: normalize(10) }}
              />
            </WrapperRow>
          )
      });
    }
  }, [isMe, data]);

  const [isAttendingEvent, setIsAttendingEvent] = useState<boolean>();

  const checkIfAttending = useCallback(async () => {
    const { currentUserId } = await volunteerUserData();

    !!currentUserId && setIsAttendingEvent(isAttending(currentUserId, attending));
  }, [participants]);

  useEffect(() => {
    checkIfAttending();
  }, [checkIfAttending]);

  // action to open source urls
  const openWebScreen = useOpenWebScreen(headerTitle, undefined, rootRouteName);

  const { mutate, isSuccess, data: dataAttend } = useMutation(calendarAttend);

  const attend = useCallback(() => {
    mutate({ id, type: isAttendingEvent ? PARTICIPANT_TYPE.REMOVE : PARTICIPANT_TYPE.ACCEPT });
  }, [isAttendingEvent]);

  useEffect(() => {
    isSuccess && dataAttend?.code == 200 && refetch();
  }, [isSuccess, dataAttend]);

  return (
    <View>
      <ImageSection mediaContents={mediaContents} />

      <WrapperWithOrientation>
        {!!title && (
          <TitleContainer>
            <Title accessibilityLabel={`(${title}) ${a11yText.heading}`}>{title}</Title>
          </TitleContainer>
        )}
        {device.platform === 'ios' && <TitleShadow />}

        {isAttendingEvent !== undefined && !!attending?.length && (
          <VolunteerEventAttending
            calendarEntryId={id}
            data={attending}
            navigation={navigation}
            isAttendingEvent={isAttendingEvent}
          />
        )}

        <Wrapper>
          <InfoCard
            category={category}
            address={address}
            webUrls={webUrls}
            openWebScreen={openWebScreen}
          />
        </Wrapper>

        {!!appointments?.length && (
          <View>
            <TitleContainer>
              <Title
                accessibilityLabel={`(${texts.volunteer.eventRecord.appointments}) ${a11yText.heading}`}
              >
                {texts.volunteer.eventRecord.appointments}
              </Title>
            </TitleContainer>
            {device.platform === 'ios' && <TitleShadow />}
            <VolunteerAppointmentsCard appointments={appointments} />
          </View>
        )}

        {!!description && (
          <View>
            <TitleContainer>
              <Title accessibilityLabel={`(${texts.volunteer.description}) ${a11yText.heading}`}>
                {texts.volunteer.description}
              </Title>
            </TitleContainer>
            {device.platform === 'ios' && <TitleShadow />}
            <Wrapper>
              <HtmlView html={description} openWebScreen={openWebScreen} />
            </Wrapper>
          </View>
        )}

        {!!documents?.length &&
          documents.map((document) => (
            <WrapperHorizontal key={document.guid}>
              <Touchable onPress={() => openLink(document.url)}>
                <View style={styles.volunteerUploadPreview}>
                  <Icon.Document color={colors.darkText} size={normalize(16)} />

                  <RegularText style={styles.volunteerInfoText} numberOfLines={1} small>
                    {document.file_name}
                  </RegularText>
                </View>
              </Touchable>
            </WrapperHorizontal>
          ))}

        {!!isAttendingEvent && !!participantInfo && (
          <View>
            <TitleContainer>
              <Title
                accessibilityLabel={`(${texts.volunteer.participantInfo}) ${a11yText.heading}`}
              >
                {texts.volunteer.participantInfo}
              </Title>
            </TitleContainer>
            {device.platform === 'ios' && <TitleShadow />}
            <Wrapper>
              <HtmlView html={participantInfo} openWebScreen={openWebScreen} />
            </Wrapper>
          </View>
        )}

        {isAttendingEvent !== undefined && (
          <Wrapper>
            {!isAttendingEvent && <RegularText small>{texts.volunteer.attendInfo}</RegularText>}
            <Button
              title={isAttendingEvent ? texts.volunteer.notAttend : texts.volunteer.attend}
              invert={isAttendingEvent}
              onPress={attend}
            />
          </Wrapper>
        )}
      </WrapperWithOrientation>
    </View>
  );
};

const styles = StyleSheet.create({
  headerRight: {
    alignItems: 'center',
    paddingRight: normalize(7)
  },
  icon: {
    paddingHorizontal: normalize(10)
  },
  volunteerInfoText: {
    width: '90%'
  },
  volunteerUploadPreview: {
    alignItems: 'center',
    backgroundColor: colors.gray20,
    borderRadius: normalize(4),
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: normalize(8),
    paddingHorizontal: normalize(20),
    paddingVertical: normalize(14)
  }
});
