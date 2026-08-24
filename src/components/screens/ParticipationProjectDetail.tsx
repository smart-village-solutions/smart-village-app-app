import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Divider } from 'react-native-elements';

import { consts, Icon, normalize, texts } from '../../config';
import {
  buildParticipationProjectCalendarValues,
  getGenericItemMatomoName,
  getParticipationProjectBody,
  getParticipationProjectLocationText,
  getParticipationProjectPlainBody,
  getParticipationProjectStatusColor,
  getParticipationProjectStatusLabel,
  getParticipationProjectType,
  hasParticipationProjectContent,
  matomoTrackingString,
  normalizeParticipationProjectDates,
  normalizeParticipationProjectValue,
  ParticipationProject
} from '../../helpers';
import { createCalendarEvent } from '../../helpers/createCalendarEvent';
import { useMatomoTrackScreenView, useOpenWebScreen } from '../../hooks';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import { GenericType } from '../../types';
import { Button } from '../Button';
import { DataProviderButton } from '../DataProviderButton';
import { DataProviderNotice } from '../DataProviderNotice';
import { ImageSection } from '../ImageSection';
import { ParticipationProjectStatusIndicator } from '../ParticipationProjectStatusIndicator';
import { SectionHeader } from '../SectionHeader';
import { StorySection } from '../StorySection';
import { HeadlineText, RegularText } from '../Text';
import { Wrapper, WrapperHorizontal, WrapperRow, WrapperVertical } from '../Wrapper';
import { InfoCard } from '../infoCard';

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

const isImage = (mediaContent: { contentType?: string }) => mediaContent.contentType === 'image';

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
  const { addresses, contacts } = data;
  const payloadContact = getPayloadContact(data);
  const infoContacts = contacts?.length ? contacts : payloadContact ? [payloadContact] : undefined;
  const hasInfo = hasInfoCardAddress(data) || !!infoContacts?.length;

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
        />
      </Wrapper>
    </>
  );
};

const ParticipationProjectAppointments = ({
  data,
  noPaddingTop = false
}: {
  data: ParticipationProject;
  noPaddingTop?: boolean;
}) => {
  const appointments = normalizeParticipationProjectDates(data);
  const openingHours = data.openingHours || [];

  if (!appointments.length && !openingHours.length) return null;

  return (
    <WrapperVertical noPaddingBottom noPaddingTop={noPaddingTop}>
      <SectionHeader title={texts.eventRecord.appointments} />
      <OpeningTimesCard
        inlineDateTime
        openingHours={appointments.length ? appointments : openingHours}
      />
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
    <Wrapper noPaddingBottom>
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
        <WrapperRow>
          <Icon.NamedIcon name="download" style={{ marginRight: normalize(8) }} />

          <RegularText primary center>
            {texts.participationProject.calendarExport}
          </RegularText>
        </WrapperRow>
      </TouchableOpacity>
    </Wrapper>
  );
};

const ParticipationProjectDetailStatusIndicator = ({ data }: { data: ParticipationProject }) => {
  const styles = useThemeStyles(createStyles);
  const statusLabel = getParticipationProjectStatusLabel(data);

  if (!statusLabel) return null;

  const statusColor = getParticipationProjectStatusColor(data);

  return (
    <WrapperHorizontal>
      <ParticipationProjectStatusIndicator
        color={statusColor}
        containerStyle={styles.statusContainer}
        label={statusLabel}
      />
    </WrapperHorizontal>
  );
};

/* eslint-disable complexity */
export const ParticipationProjectDetail = ({ data, readAloudControls, route }: Props) => {
  const { companies, dataProvider, genericType, mediaContents, title, webUrls } = data;
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

      <ParticipationProjectDetailStatusIndicator data={data} />

      {!!imageMediaContents.length && (
        <WrapperVertical>
          <ImageSection mediaContents={imageMediaContents} />
        </WrapperVertical>
      )}

      <ParticipationProjectInfo data={data} openWebScreen={openWebScreen} />
      <ParticipationProjectCalendarExport data={data} />
      <WrapperHorizontal>
        <Divider />
      </WrapperHorizontal>
      {readAloudControls}
      <ParticipationProjectAppointments data={data} noPaddingTop={!!readAloudControls} />
      <ParticipationProjectContent data={data} openWebScreen={openWebScreen} />

      {!!link && (
        <Wrapper noPaddingTop>
          <RegularText>{texts.participationProject.portalHint}</RegularText>
        </Wrapper>
      )}
      <ParticipationProjectLink
        description={webUrls?.[0]?.description}
        link={link}
        openWebScreen={openWebScreen}
      />

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

const createStyles = () => ({
  statusContainer: {
    marginBottom: normalize(12),
    marginTop: normalize(4)
  }
});
