import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback, useContext, useEffect, useLayoutEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { useMutation } from 'react-query';

import { colors, styles as configStyles, consts, Icon, normalize, texts } from '../../config';
import { isAttending, momentFormat, openLink, volunteerUserData } from '../../helpers';
import { createCalendarEvent } from '../../helpers/createCalendarEvent';
import { useOpenWebScreen } from '../../hooks';
import { QUERY_TYPES } from '../../queries';
import { calendarAttend } from '../../queries/volunteer';
import { SettingsContext } from '../../SettingsProvider';
import { PARTICIPANT_TYPE, ScreenName } from '../../types';
import { Button } from '../Button';
import { HeaderRight } from '../HeaderRight';
import { HtmlView } from '../HtmlView';
import { ImageSection } from '../ImageSection';
import { InfoCard } from '../infoCard';
import { SectionHeader } from '../SectionHeader';
import { RegularText } from '../Text';
import { Touchable } from '../Touchable';
import { Wrapper, WrapperHorizontal } from '../Wrapper';

import { VolunteerAppointmentsCard } from './VolunteerAppointmentsCard';
import { VolunteerEventAttending } from './VolunteerEventAttending';

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
    all_day: allDay,
    content,
    description,
    end_datetime: endDatetime,
    id,
    location,
    participant_info: participantInfo,
    participants,
    start_datetime: startDatetime,
    title,
    webUrls
  } = data;
  const { globalSettings } = useContext(SettingsContext);
  const { navigation: navigationType } = globalSettings;

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
      allDay,
      dateFrom: momentFormat(startDatetime, 'YYYY-MM-DD'),
      dateTo: momentFormat(endDatetime, 'YYYY-MM-DD'),
      timeFrom: momentFormat(startDatetime, 'HH:mm'),
      timeTo: momentFormat(endDatetime, 'HH:mm')
    }
  ];
  const [isMy, setIsMy] = useState<boolean>();
  const [isAttendingEvent, setIsAttendingEvent] = useState<boolean>();

  // action to open source urls
  const openWebScreen = useOpenWebScreen(headerTitle, undefined, rootRouteName);

  const { mutate, isSuccess, data: dataAttend } = useMutation(calendarAttend);

  const attend = useCallback(() => {
    mutate({ id, type: isAttendingEvent ? PARTICIPANT_TYPE.REMOVE : PARTICIPANT_TYPE.ACCEPT });
  }, [isAttendingEvent]);

  const checkIfMe = useCallback(async () => {
    const { currentUserId } = await volunteerUserData();

    !!currentUserId && setIsMy(currentUserId == content?.metadata?.created_by?.id);
  }, [data]);

  useEffect(() => {
    checkIfMe();
  }, [checkIfMe]);

  useLayoutEffect(() => {
    if (isMy) {
      navigation.setOptions({
        headerRight: () => (
          <HeaderRight
            {...{
              navigation,
              onPress: () =>
                navigation.navigate(ScreenName.VolunteerForm, {
                  query: QUERY_TYPES.VOLUNTEER.CALENDAR,
                  calendarData: { ...data, isPublic: content?.metadata?.visibility },
                  groupId: content?.metadata?.contentcontainer_id
                }),
              route,
              withDrawer: navigationType === 'drawer',
              withEdit: true,
              withShare: true
            }}
          />
        )
      });
    }
  }, [isMy, data]);

  const checkIfAttending = useCallback(async () => {
    const { currentUserId } = await volunteerUserData();

    !!currentUserId && setIsAttendingEvent(isAttending(currentUserId, attending));
  }, [participants]);

  useEffect(() => {
    checkIfAttending();
  }, [checkIfAttending]);

  useEffect(() => {
    isSuccess && dataAttend?.code == 200 && refetch();
  }, [isSuccess, dataAttend]);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [])
  );

  return (
    <View>
      <ImageSection mediaContents={mediaContents} />
      <SectionHeader title={title} />
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
          <SectionHeader title={texts.volunteer.eventRecord.appointments} />
          <VolunteerAppointmentsCard appointments={appointments} />
        </View>
      )}

      {!!description && (
        <View>
          <SectionHeader title={texts.volunteer.description} />
          <Wrapper>
            <Markdown
              onLinkPress={(url) => {
                openLink(url, openWebScreen);
                return false;
              }}
              style={configStyles.markdown}
            >
              {description}
            </Markdown>
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
          <SectionHeader title={texts.volunteer.participantInfo} />
          <Wrapper>
            <HtmlView html={participantInfo} openWebScreen={openWebScreen} />
          </Wrapper>
        </View>
      )}

      <Wrapper>
        {isAttendingEvent !== undefined && !isAttendingEvent && (
          <RegularText small>{texts.volunteer.attendInfo}</RegularText>
        )}
        <Button
          title={isAttendingEvent ? texts.volunteer.notAttend : texts.volunteer.attend}
          invert={isAttendingEvent}
          onPress={attend}
        />
        <TouchableOpacity
          accessibilityLabel={`${texts.volunteer.calendarExport} ${consts.a11yLabel.button}`}
          accessibilityRole="button"
          onPress={() =>
            createCalendarEvent({
              allDay: !!allDay,
              description,
              endDatetime,
              location,
              startDatetime,
              title
            })
          }
        >
          <RegularText primary center>
            {texts.volunteer.calendarExport}
          </RegularText>
        </TouchableOpacity>
      </Wrapper>
    </View>
  );
};

const styles = StyleSheet.create({
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
