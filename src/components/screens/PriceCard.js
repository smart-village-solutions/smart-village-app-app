import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components/native';

import { device, normalize } from '../../config';
import { DiagonalGradient } from '../DiagonalGradient';
import { WrapperWrap } from '../Wrapper';
import { LightestText, BoldText } from '../Text';
import { priceFormat } from '../../helpers';

const PriceBox = styled.View`
  background-color: rgba(15, 70, 24, 0.6);
  flex-direction: column;
  margin-bottom: ${normalize(14)}px;
  padding: ${normalize(7)}px;
  width: ${device.width * 0.5 - normalize(14) * 1.5};
`;

export const PriceCard = ({ prices }) => (
  <DiagonalGradient style={{ padding: normalize(14) }}>
    <WrapperWrap>
      {!!prices &&
        prices.map((item, index) => {
          const {
            category,
            amount,
            description,
            maxChildrenCount,
            maxAdultCount,
            groupPrice
          } = item;

          return (
            <PriceBox key={index}>
              {!!category && (
                <BoldText small light>
                  {category}
                </BoldText>
              )}
              {!!amount && (
                <BoldText small light>
                  {priceFormat(amount)}
                </BoldText>
              )}
              {!!groupPrice && (
                <BoldText small light>
                  {priceFormat(groupPrice)}
                </BoldText>
              )}
              {!!description && <LightestText small>{description}</LightestText>}
              {!!maxAdultCount && <LightestText small>{maxAdultCount} Erwachsene</LightestText>}
              {!!maxChildrenCount && <LightestText small>{maxChildrenCount} Kinder</LightestText>}
            </PriceBox>
          );
        })}
    </WrapperWrap>
  </DiagonalGradient>
);

PriceCard.propTypes = {
  prices: PropTypes.array
};
