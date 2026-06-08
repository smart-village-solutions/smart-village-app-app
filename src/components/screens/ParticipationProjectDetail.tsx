import React, { useContext } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { NetworkContext } from '../../NetworkProvider';
import { colors, consts, normalize, texts } from '../../config';
import {
  buildParticipationProjectCalendarValues,
  getGenericItemMatomoName,
  getParticipationProjectBody,
  getParticipationProjectGeoLocation,
  getParticipationProjectLocationText,
  getParticipationProjectPlainBody,
  getParticipationProjectType,
  hasParticipationProjectContent,
  matomoTrackingString,
  momentFormat,
  normalizeParticipationProjectDates,
  normalizeParticipationProjectTags,
  normalizeParticipationProjectValue,
  ParticipationProject
} from '../../helpers';
import { createCalendarEvent } from '../../helpers/createCalendarEvent';
import { useMatomoTrackScreenView, useOpenWebScreen } from '../../hooks';
import { GenericType } from '../../types';
import { Button } from '../Button';
import { DataProviderButton } from '../DataProviderButton';
import { DataProviderNotice } from '../DataProviderNotice';
import { ImageSection } from '../ImageSection';
import { SectionHeader } from '../SectionHeader';
import { StorySection } from '../StorySection';
import { BoldText, HeadlineText, RegularText } from '../Text';
import { Wrapper, WrapperHorizontal, WrapperRow, WrapperVertical, WrapperWrap } from '../Wrapper';
import { InfoCard } from '../infoCard';
import { MapLibre } from '../map';

import { OpeningTimesCard } from './OpeningTimesCard';
import { OperatingCompany } from './OperatingCompany';

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

const { MAP } = consts;

const isImage = (mediaContent: { contentType?: string }) => mediaContent.contentType === 'image';

type MetaProps = Pick<
  ParticipationProject,
  'createdAt' | 'publicationDate' | 'publishedAt' | 'updatedAt'
>;

const ParticipationProjectMeta = ({
  createdAt,
  publicationDate,
  publishedAt,
  updatedAt
}: MetaProps) => {
  const displayDate = publicationDate || publishedAt || createdAt;

  if (!displayDate && !updatedAt) return null;

  return (
    <Wrapper noPaddingTop>
      {!!displayDate && (
        <WrapperRow>
          <BoldText>{texts.participationProject.publishedAt}: </BoldText>
          <RegularText>{momentFormat(displayDate)}</RegularText>
        </WrapperRow>
      )}

      {!!updatedAt && updatedAt !== displayDate && (
        <WrapperRow>
          <BoldText>{texts.participationProject.updatedAt}: </BoldText>
          <RegularText>{momentFormat(updatedAt)}</RegularText>
        </WrapperRow>
      )}
    </Wrapper>
  );
};

const getPayloadContact = ({ payload }: ParticipationProject) => {
  const contact = normalizeParticipationProjectValue(payload?.contact);
  const email = normalizeParticipationProjectValue(payload?.email);
  const phone = normalizeParticipationProjectValue(payload?.phone);

  if (!contact && !email && !phone) return;

  return {
    email,
    firstName: contact,
    phone
  };
};

const hasInfoCardAddress = ({ addresses }: ParticipationProject) =>
  addresses?.some((address) =>
    normalizeParticipationProjectValue(
      [address.addition, address.street, address.zip, address.city].filter(Boolean).join(' ')
    )
  );

const ParticipationProjectInfo = ({
  data,
  openWebScreen
}: {
  data: ParticipationProject;
  openWebScreen: (link: string) => void;
}) => {
  const { addresses, contacts, webUrls } = data;
  const payloadContact = getPayloadContact(data);
  const infoContacts = contacts?.length ? contacts : payloadContact ? [payloadContact] : undefined;
  const hasInfo = hasInfoCardAddress(data) || !!infoContacts?.length || !!webUrls?.length;

  if (!hasInfo) return null;

  return (
    <>
      <SectionHeader title={texts.participationProject.overview} />
      <Wrapper>
        <InfoCard
          addresses={addresses}
          contacts={infoContacts}
          openWebScreen={openWebScreen}
          showOpeningTimes={false}
          webUrls={webUrls}
        />
      </Wrapper>
    </>
  );
};

const ParticipationProjectMetaRows = ({ data }: { data: ParticipationProject }) => {
  const { payload = {} } = data;
  const rows = [
    {
      label: texts.participationProject.theme,
      value: normalizeParticipationProjectValue(payload.theme)
    },
    {
      label: texts.participationProject.status,
      value: normalizeParticipationProjectValue(payload.status)
    },
    {
      label: texts.participationProject.instance,
      value: normalizeParticipationProjectValue(payload.instance)
    },
    {
      label: texts.participationProject.organizer,
      value: normalizeParticipationProjectValue(payload.organizer)
    },
    {
      label: texts.participationProject.capacity,
      value: normalizeParticipationProjectValue(payload.capacity)
    },
    {
      label: texts.participationProject.registrationRequired,
      value:
        typeof payload.registrationRequired === 'boolean'
          ? payload.registrationRequired
            ? texts.participationProject.yes
            : texts.participationProject.no
          : normalizeParticipationProjectValue(payload.registrationRequired)
    },
    {
      label: texts.participationProject.statistics,
      value: normalizeParticipationProjectValue(payload.statistics)
    }
  ].filter(({ value }) => !!value);
  const tags = normalizeParticipationProjectTags(payload.tags);

  if (!rows.length && !tags.length) return null;

  return (
    <Wrapper noPaddingTop>
      {rows.map(({ label, value }) => (
        <WrapperRow key={label} style={styles.metaRow}>
          <BoldText>{label}: </BoldText>
          <RegularText style={styles.metaValue}>{value}</RegularText>
        </WrapperRow>
      ))}

      {!!tags.length && (
        <WrapperRow style={styles.metaRow}>
          <BoldText>{texts.participationProject.tags}: </BoldText>
          <WrapperWrap style={styles.tagWrapper}>
            {tags.map((tag) => (
              <RegularText
                key={tag}
                small
                accessibilityLabel={`(${texts.participationProject.tags}) (${tag})`}
                style={styles.tag}
              >
                {tag}
              </RegularText>
            ))}
          </WrapperWrap>
        </WrapperRow>
      )}
    </Wrapper>
  );
};

const ParticipationProjectAppointments = ({ data }: { data: ParticipationProject }) => {
  const appointments = normalizeParticipationProjectDates(data);
  const openingHours = data.openingHours || [];

  if (!appointments.length && !openingHours.length) return null;

  return (
    <WrapperVertical>
      <SectionHeader title={texts.eventRecord.appointments} />
      <OpeningTimesCard openingHours={appointments.length ? appointments : openingHours} />
    </WrapperVertical>
  );
};

const ParticipationProjectContent = ({
  data,
  openWebScreen
}: {
  data: ParticipationProject;
  openWebScreen: (url?: string) => void;
}) => {
  if (!getParticipationProjectBody(data)) return null;

  return (
    <WrapperVertical>
      <SectionHeader title={texts.eventRecord.description} />
      {data.contentBlocks?.length ? (
        data.contentBlocks.map((contentBlock, index) => (
          <StorySection
            contentBlock={contentBlock}
            index={index}
            key={`${contentBlock.id}-${index}`}
            openWebScreen={openWebScreen}
            settings={data.settings}
          />
        ))
      ) : (
        <WrapperHorizontal>
          <RegularText>{data.teaser || data.description}</RegularText>
        </WrapperHorizontal>
      )}
    </WrapperVertical>
  );
};

const ParticipationProjectMap = ({ data }: { data: ParticipationProject }) => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const geoLocation = getParticipationProjectGeoLocation(data);

  if (!geoLocation || !isConnected || !isMainserverUp) return null;

  return (
    <WrapperVertical>
      <SectionHeader title={texts.pointOfInterest.location} />
      <MapLibre
        isMultipleMarkersMap={false}
        isMyLocationButtonVisible={false}
        locations={[
          {
            iconName: MAP.DEFAULT_PIN,
            activeIconName: `${MAP.DEFAULT_PIN}Active`,
            id: data.id,
            position: geoLocation
          }
        ]}
        mapStyle={styles.mapStyle}
        selectedMarker={data.id}
      />
    </WrapperVertical>
  );
};

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

const ParticipationProjectCalendarExport = ({ data }: { data: ParticipationProject }) => {
  const { title } = data;
  const { allDay, endDatetime, startDatetime } = buildParticipationProjectCalendarValues(data);

  if (!title || !startDatetime || !endDatetime) return null;

  return (
    <Wrapper noPaddingTop>
      <TouchableOpacity
        accessibilityLabel={`${texts.participationProject.calendarExport} ${consts.a11yLabel.button}`}
        accessibilityRole="button"
        onPress={() =>
          createCalendarEvent({
            allDay,
            description: getParticipationProjectPlainBody(data),
            endDatetime,
            location: getParticipationProjectLocationText(data),
            startDatetime,
            title
          })
        }
      >
        <RegularText primary center>
          {texts.participationProject.calendarExport}
        </RegularText>
      </TouchableOpacity>
    </Wrapper>
  );
};

/* eslint-disable complexity */
export const ParticipationProjectDetail = ({ data, readAloudControls, route }: Props) => {
  const {
    companies,
    createdAt,
    dataProvider,
    genericType,
    mediaContents,
    publicationDate,
    publishedAt,
    title,
    updatedAt,
    webUrls
  } = data;
  const link = webUrls?.[0]?.url;
  const imageMediaContents = mediaContents?.filter(isImage) || [];
  const rootRouteName = route.params?.rootRouteName ?? '';
  const headerTitle = route.params?.title ?? texts.participationProject.participationProject;
  const openWebScreen = useOpenWebScreen(headerTitle, link, rootRouteName);
  const type = getParticipationProjectType(data);
  const operatingCompany =
    companies?.[0] ||
    (data.payload?.organizer
      ? {
          name: normalizeParticipationProjectValue(data.payload.organizer)
        }
      : undefined);
  const businessAccount = dataProvider?.dataType === 'business_account';

  useMatomoTrackScreenView(
    matomoTrackingString([
      getGenericItemMatomoName(genericType as GenericType),
      dataProvider?.name,
      type,
      title
    ])
  );

  return (
    <View>
      {!!type && (
        <WrapperHorizontal>
          <HeadlineText smaller uppercase>
            {type}
          </HeadlineText>
        </WrapperHorizontal>
      )}

      {!!title && <SectionHeader big title={title} />}

      {!!imageMediaContents.length && (
        <WrapperVertical>
          <ImageSection mediaContents={imageMediaContents} />
        </WrapperVertical>
      )}
      {readAloudControls}

      <ParticipationProjectMeta
        createdAt={createdAt}
        publicationDate={publicationDate}
        publishedAt={publishedAt}
        updatedAt={updatedAt}
      />

      <ParticipationProjectInfo data={data} openWebScreen={openWebScreen} />
      <ParticipationProjectMetaRows data={data} />
      <ParticipationProjectAppointments data={data} />
      <ParticipationProjectContent data={data} openWebScreen={openWebScreen} />
      <ParticipationProjectMap data={data} />

      <ParticipationProjectLink
        description={webUrls?.[0]?.description}
        link={link}
        openWebScreen={openWebScreen}
      />
      {!!link && (
        <Wrapper noPaddingTop>
          <RegularText>{texts.participationProject.portalHint}</RegularText>
        </Wrapper>
      )}
      <ParticipationProjectCalendarExport data={data} />

      {!hasParticipationProjectContent(data) && (
        <Wrapper>
          <RegularText>{texts.participationProject.empty}</RegularText>
        </Wrapper>
      )}

      <OperatingCompany
        openWebScreen={openWebScreen}
        operatingCompany={operatingCompany}
        title={texts.pointOfInterest.operatingCompany}
      />

      <DataProviderNotice dataProvider={dataProvider} openWebScreen={openWebScreen} />

      {!!businessAccount && !!dataProvider?.name && (
        <DataProviderButton dataProvider={{ ...dataProvider, name: dataProvider.name }} />
      )}
    </View>
  );
};
/* eslint-enable complexity */

const styles = StyleSheet.create({
  mapStyle: {
    height: normalize(300),
    width: '100%'
  },
  metaRow: {
    marginBottom: normalize(8)
  },
  metaValue: {
    flex: 1
  },
  tag: {
    borderColor: colors.borderRgba,
    borderRadius: normalize(4),
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: normalize(4),
    marginRight: normalize(6),
    paddingHorizontal: normalize(6),
    paddingVertical: normalize(2)
  },
  tagWrapper: {
    flex: 1
  }
});
