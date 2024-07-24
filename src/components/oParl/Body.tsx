import { StackNavigationProp } from '@react-navigation/stack';
import React, { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';

import { normalize, texts } from '../../config';
import { momentFormat } from '../../helpers';
import { BodyData } from '../../types';
import { PreviewSection } from '../PreviewSection';
import { RegularText } from '../Text';
import { Touchable } from '../Touchable';
import { WrapperHorizontal } from '../Wrapper';

import { FormattedLocation } from './previews';
import { Row, SimpleRow } from './Row';
import {
  ContactSection,
  KeywordSection,
  ModifiedSection,
  OParlPreviewSection,
  WebRepresentation
} from './sections';

type Props = {
  data: BodyData;
  navigation: StackNavigationProp<any>;
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

  const onPressLicense = useCallback(
    () => navigation.push('Web', { webUrl: license }),
    [navigation, license]
  );

  const onPressWebsite = useCallback(
    () => navigation.push('Web', { webUrl: website }),
    [navigation, website]
  );

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
    <>
      <WrapperHorizontal>
        <Row left={bodyTexts.name} right={shortName ? `${shortName} (${name})` : name} />
        <Row left={bodyTexts.classification} right={classification} />
        <Row left={bodyTexts.ags} right={ags} fullText />
        <Row left={bodyTexts.rgs} right={rgs} fullText />
        {!!location && (
          <Row left={bodyTexts.location} right={<FormattedLocation location={location} />} />
        )}
      </WrapperHorizontal>
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
      <OParlPreviewSection data={system} header={bodyTexts.system} navigation={navigation} />
      <View style={styles.marginTop}>
        <PreviewSection
          data={equivalent}
          renderItem={renderEquivalentItem}
          header={bodyTexts.equivalent}
        />
      </View>
      <WrapperHorizontal>
        <ContactSection contactEmail={contactEmail} contactName={contactName} />
        <SimpleRow
          fullText
          left={bodyTexts.oparlSince}
          right={oparlSince && momentFormat(oparlSince.valueOf(), undefined, 'x')}
        />
        <SimpleRow left={bodyTexts.website} onPress={onPressWebsite} right={website} />
        <KeywordSection keyword={keyword} />
        <SimpleRow left={bodyTexts.license} onPress={onPressLicense} right={license} />
        <SimpleRow
          left={bodyTexts.licenseValidSince}
          right={
            license?.length && licenseValidSince
              ? momentFormat(licenseValidSince?.valueOf(), undefined, 'x')
              : undefined
          }
        />
        <WebRepresentation name={name || bodyTexts.body} navigation={navigation} web={web} />
        <ModifiedSection created={created} deleted={deleted} modified={modified} />
      </WrapperHorizontal>
    </>
  );
};

const styles = StyleSheet.create({
  marginTop: {
    marginTop: normalize(12)
  }
});
