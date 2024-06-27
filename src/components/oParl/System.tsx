import { StackNavigationProp } from '@react-navigation/stack';
import React, { useCallback } from 'react';

import { texts } from '../../config';
import { SystemData } from '../../types';
import { Wrapper, WrapperHorizontal } from '../Wrapper';

import { Row, SimpleRow } from './Row';
import {
  ContactSection,
  ModifiedSection,
  OParlPreviewSection,
  WebRepresentation
} from './sections';

type Props = {
  data: SystemData;
  navigation: StackNavigationProp<any>;
};

const { system: systemTexts } = texts.oparl;

const leftWidth = 120;

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

  const onPressLicense = useCallback(
    () => navigation.push('Web', { webUrl: license }),
    [navigation, license]
  );

  const onPressProduct = useCallback(
    () => navigation.push('Web', { webUrl: product }),
    [navigation, product]
  );

  const onPressVendor = useCallback(
    () => navigation.push('Web', { webUrl: vendor }),
    [navigation, vendor]
  );

  const onPressWebsite = useCallback(
    () => navigation.push('Web', { webUrl: website }),
    [navigation, website]
  );

  return (
    <>
      <WrapperHorizontal>
        <Row left={systemTexts.name} right={name} leftWidth={leftWidth} />
        <Row left={systemTexts.oparlVersion} right={oparlVersion} leftWidth={leftWidth} />
      </WrapperHorizontal>
      <OParlPreviewSection data={body} header={systemTexts.body} navigation={navigation} />
      <Wrapper>
        <SimpleRow left={systemTexts.product} right={product} onPress={onPressProduct} />
        <SimpleRow left={systemTexts.vendor} right={vendor} onPress={onPressVendor} />
        <SimpleRow left={systemTexts.website} right={website} onPress={onPressWebsite} />
        <ContactSection contactEmail={contactEmail} contactName={contactName} />
        <SimpleRow
          left={systemTexts.otherOparlVersion}
          right={otherOparlVersion?.join(', ')}
          selectable
          fullText
        />
        <SimpleRow left={systemTexts.license} right={license} onPress={onPressLicense} />
        <WebRepresentation name={name || systemTexts.system} navigation={navigation} web={web} />
        <ModifiedSection created={created} deleted={deleted} modified={modified} />
      </Wrapper>
    </>
  );
};
