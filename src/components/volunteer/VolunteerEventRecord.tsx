import { StackScreenProps } from '@react-navigation/stack';
import React from 'react';
import { View } from 'react-native';

import { consts, device, texts } from '../../config';
import { momentFormat } from '../../helpers';
import { useOpenWebScreen } from '../../hooks';
import { HtmlView } from '../HtmlView';
import { ImageSection } from '../ImageSection';
import { InfoCard } from '../infoCard';
import { Title, TitleContainer, TitleShadow } from '../Title';
import { Wrapper, WrapperWithOrientation } from '../Wrapper';

import { VolunteerAppointmentsCard } from './VolunteerAppointmentsCard';

const a11yText = consts.a11yLabel;

// eslint-disable-next-line complexity
export const VolunteerEventRecord = ({ data, route }: { data: any } & StackScreenProps<any>) => {
  const {
    content,
    description,
    end_datetime: endDatetime,
    participant_info,
    participants,
    start_datetime: startDatetime,
    title,
    webUrls
  } = data;
  const { files, topics } = content;
  const mediaContents = files?.map(({ mime_type, url }: { mime_type: string; url: string }) => ({
    contentType: mime_type.includes('image') ? 'image' : mime_type,
    sourceUrl: { url }
  }));

  const { attending, declined, maybe } = participants;
  const rootRouteName = route.params?.rootRouteName ?? '';
  const headerTitle = route.params?.title ?? '';
  const category = topics?.length
    ? {
        name: topics.map((topic: { name: string }) => topic.name).join(', ')
      }
    : undefined;
  const appointments = [
    {
      dateFrom: momentFormat(startDatetime, 'YYYY-MM-DD'),
      dateTo: momentFormat(endDatetime, 'YYYY-MM-DD'),
      timeFrom: momentFormat(startDatetime, 'HH:mm'),
      timeTo: momentFormat(endDatetime, 'HH:mm')
    }
  ];

  // action to open source urls
  const openWebScreen = useOpenWebScreen(headerTitle, undefined, rootRouteName);

  return (
    <View>
      {!!mediaContents?.length && <ImageSection mediaContents={mediaContents} />}

      <WrapperWithOrientation>
        {!!title && (
          <TitleContainer>
            <Title accessibilityLabel={`(${title}) ${a11yText.heading}`}>{title}</Title>
          </TitleContainer>
        )}
        {device.platform === 'ios' && <TitleShadow />}

        <Wrapper>
          <InfoCard category={category} webUrls={webUrls} openWebScreen={openWebScreen} />
        </Wrapper>

        {!!appointments?.length && (
          <View>
            <TitleContainer>
              <Title accessibilityLabel={`(${texts.eventRecord.appointments}) ${a11yText.heading}`}>
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
              <Title accessibilityLabel={`(${texts.eventRecord.description}) ${a11yText.heading}`}>
                {texts.eventRecord.description}
              </Title>
            </TitleContainer>
            {device.platform === 'ios' && <TitleShadow />}
            <Wrapper>
              <HtmlView html={description} openWebScreen={openWebScreen} />
            </Wrapper>
          </View>
        )}
      </WrapperWithOrientation>
    </View>
  );
};
