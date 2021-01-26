import React, { useCallback } from 'react';
import { NavigationScreenProp } from 'react-navigation';

import { texts } from '../../config';
import { BodyPreviewData, SystemData, SystemPreviewData } from '../../types';
import { PreviewSection } from '../PreviewSection';
import { Wrapper } from '../Wrapper';
import { LineEntry } from './LineEntry';
import { BodyPreview } from './previews';
import { SystemPreview } from './previews/SystemPreview';
import { ContactSection, ModifiedSection, WebRepresentation } from './sections';

type Props = {
  data: SystemData;
  navigation: NavigationScreenProp<never>;
};

const { system: systemTexts } = texts.oparl;

export const System = ({ data, navigation }: Props) => {
  const {
    body,
    name,
    web,
    deleted,
    modified,
    created,
    oparlVersion,
    contactEmail,
    contactName,
    license,
    otherOparlVersion,
    product,
    vendor,
    website
  } = data;

  const onPressLicense = useCallback(() => navigation.push('Web', { webUrl: license }), [
    navigation,
    license
  ]);

  const onPressProduct = useCallback(() => navigation.push('Web', { webUrl: product }), [
    navigation,
    product
  ]);

  const onPressVendor = useCallback(() => navigation.push('Web', { webUrl: vendor }), [
    navigation,
    vendor
  ]);

  const onPressWebsite = useCallback(() => navigation.push('Web', { webUrl: website }), [
    navigation,
    website
  ]);

  const renderBodyPreview = useCallback(
    (data: BodyPreviewData, index) => (
      <BodyPreview data={data} key={index} navigation={navigation} />
    ),
    [navigation]
  );

  const renderSystemPreview = useCallback(
    (data: SystemPreviewData, index) => (
      <SystemPreview data={data} key={index} navigation={navigation} />
    ),
    [navigation]
  );

  return (
    <Wrapper>
      <LineEntry left={systemTexts.name} right={name} />
      <LineEntry left={systemTexts.oparlVersion} right={oparlVersion} />
      <LineEntry left={systemTexts.license} right={license} onPress={onPressLicense} />
      <PreviewSection data={body} header={systemTexts.body} renderItem={renderBodyPreview} />
      <LineEntry left={systemTexts.product} right={product} onPress={onPressProduct} />
      <LineEntry left={systemTexts.vendor} right={vendor} onPress={onPressVendor} />
      <LineEntry left={systemTexts.website} right={website} onPress={onPressWebsite} />
      <ContactSection contactEmail={contactEmail} contactName={contactName} />
      <PreviewSection
        data={otherOparlVersion}
        header={systemTexts.otherOparlVersion}
        renderItem={renderSystemPreview}
      />
      <WebRepresentation name={name ?? systemTexts.system} navigation={navigation} web={web} />
      <ModifiedSection created={created} deleted={deleted} modified={modified} />
    </Wrapper>
  );
};
