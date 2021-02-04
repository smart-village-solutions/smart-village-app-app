import React, { useCallback } from 'react';
import { NavigationScreenProp } from 'react-navigation';

import { texts } from '../../config';
import { momentFormat } from '../../helpers';
import { BodyData } from '../../types';
import { PreviewSection } from '../PreviewSection';
import { RegularText } from '../Text';
import { Touchable } from '../Touchable';
import { Wrapper } from '../Wrapper';
import { LineEntry } from './LineEntry';
import {
  ContactSection,
  KeywordSection,
  ModifiedSection,
  OParlPreviewSection,
  WebRepresentation
} from './sections';

type Props = {
  data: BodyData;
  navigation: NavigationScreenProp<never>;
};

const { body: bodyTexts } = texts.oparl;

export const Body = ({ data, navigation }: Props) => {
  const {
    agendaItem,
    ags,
    classification,
    consultation,
    contactEmail,
    contactName,
    created,
    deleted,
    equivalent,
    file,
    keyword,
    legislativeTerm,
    legislativeTermList,
    license,
    licenseValidSince,
    location,
    locationList,
    meeting,
    membership,
    modified,
    name,
    oparlSince,
    organization,
    paper,
    person,
    rgs,
    shortName,
    system,
    web,
    website
  } = data;

  const onPressLicense = useCallback(() => navigation.push('Web', { webUrl: license }), [
    navigation,
    license
  ]);

  const onPressWebsite = useCallback(() => navigation.push('Web', { webUrl: website }), [
    navigation,
    website
  ]);

  const renderEquivalentItem = useCallback(
    (url, index) => (
      <Touchable
        key={index}
        onPress={() => navigation.push('Web', { webUrl: url, title: shortName ?? name })}
      >
        <RegularText numberOfLines={1} primary>
          {url}
        </RegularText>
      </Touchable>
    ),
    [name, navigation, shortName]
  );

  return (
    <Wrapper>
      <LineEntry left={bodyTexts.name} right={shortName ? `${shortName} (${name})` : name} />
      <OParlPreviewSection data={location} header={bodyTexts.location} navigation={navigation} />
      <LineEntry left={bodyTexts.website} onPress={onPressWebsite} right={website} />
      <ContactSection contactEmail={contactEmail} contactName={contactName} />
      <OParlPreviewSection
        data={legislativeTermList ?? legislativeTerm}
        header={bodyTexts.legislativeTerm}
        navigation={navigation}
      />
      <OParlPreviewSection
        data={organization}
        header={bodyTexts.organization}
        navigation={navigation}
      />
      <OParlPreviewSection data={meeting} header={bodyTexts.meeting} navigation={navigation} />
      <OParlPreviewSection data={paper} header={bodyTexts.paper} navigation={navigation} />
      <OParlPreviewSection
        data={agendaItem}
        header={bodyTexts.agendaItem}
        navigation={navigation}
      />
      <OParlPreviewSection
        data={consultation}
        header={bodyTexts.consultation}
        navigation={navigation}
      />
      <OParlPreviewSection data={file} header={bodyTexts.file} navigation={navigation} />
      <OParlPreviewSection data={person} header={bodyTexts.person} navigation={navigation} />
      <OParlPreviewSection
        data={membership}
        header={bodyTexts.memberships}
        navigation={navigation}
      />
      <OParlPreviewSection
        data={locationList}
        header={bodyTexts.locationList}
        navigation={navigation}
      />
      <LineEntry left={bodyTexts.classification} right={classification} />
      <LineEntry fullText left={bodyTexts.ags} right={ags} />
      <LineEntry fullText left={bodyTexts.rgs} right={rgs} />
      <OParlPreviewSection data={system} header={bodyTexts.system} navigation={navigation} />
      <LineEntry
        fullText
        left={bodyTexts.oparlSince}
        right={oparlSince && momentFormat(oparlSince.valueOf(), undefined, 'x')}
      />
      <PreviewSection
        data={equivalent}
        renderItem={renderEquivalentItem}
        header={bodyTexts.equivalent}
      />
      <KeywordSection keyword={keyword} />
      <LineEntry left={bodyTexts.license} onPress={onPressLicense} right={license} />
      <LineEntry
        left={bodyTexts.licenseValidSince}
        onPress={onPressLicense}
        right={
          license?.length && licenseValidSince
            ? momentFormat(licenseValidSince?.valueOf(), undefined, 'x')
            : undefined
        }
      />
      <WebRepresentation name={name ?? bodyTexts.body} navigation={navigation} web={web} />
      <ModifiedSection created={created} deleted={deleted} modified={modified} />
    </Wrapper>
  );
};
