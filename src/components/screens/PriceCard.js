import React from 'react';
import styled from 'styled-components';

import { device, colors, normalize } from '../../config';
import { DiagonalGradient, WrapperRow } from '../../components';

const PreiceBox = styled.View`
  width: ${device.width * 0.5 - normalize(14) * 1.5};
  height: 100;
  background-color: #3f745f;
`;
const PreiceText = styled.Text`
  color: ${colors.lightestText};
  font-family: titillium-web-bold;
  font-size: ${normalize(15)};
  margin-left: 10;
`;
const DescriptionText = styled(PreiceText)`
  font-family: titillium-web-regular;
`;
export const PriceCard = () => (
  <DiagonalGradient style={{ padding: normalize(14) }}>
    <WrapperRow style={{ justifyContent: 'space-between', marginBottom: normalize(14) }}>
      <PreiceBox>
        <PreiceText>Erwachsene</PreiceText>
        <PreiceText>EUR 2,50</PreiceText>
      </PreiceBox>
      <PreiceBox>
        <PreiceText>Ermäßigung</PreiceText>
        <PreiceText>EUR 1,50</PreiceText>
      </PreiceBox>
    </WrapperRow>

    <WrapperRow style={{ justifyContent: 'space-between' }}>
      <PreiceBox>
        <PreiceText>Familien</PreiceText>
        <DescriptionText>2 Erwachsene, 3 Kinder, 5 – 17 J.</DescriptionText>
        <PreiceText>EUR 6,50</PreiceText>
      </PreiceBox>

      <PreiceBox>
        <PreiceText>Kurzbesuch</PreiceText>
        <DescriptionText>nur Turm, ohne Museum</DescriptionText>
        <PreiceText>EUR 1,00</PreiceText>
      </PreiceBox>
    </WrapperRow>
  </DiagonalGradient>
);
