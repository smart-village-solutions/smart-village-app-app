import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components/native';

import { colors, device, normalize } from '../../config';
import { DiagonalGradient } from '../DiagonalGradient';
import { WrapperWrap } from '../Wrapper';
import { RegularText, BoldText } from '../Text';
import { priceFormat } from '../../helpers';

const PriceBox = styled.View`
  background-color: ${colors.darkerPrimaryRgba};
  flex-direction: column;
  margin-bottom: ${normalize(14)}px;
  padding: ${normalize(7)}px;
  width: ${device.width * 0.5 - normalize(14) * 1.5};
`;

export const PriceCard = ({ prices }) => (
  <DiagonalGradient style={{ padding: normalize(14) }}>
    <WrapperWrap spaceBetween>
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
          const formattedAmount = priceFormat(amount);
          const formattedGroupPrice = priceFormat(groupPrice);

          return (
            <PriceBox key={index}>
              {!!category && (
                <BoldText small lightest>
                  {category}
                </BoldText>
              )}
              {!!formattedAmount && (
                <BoldText small lightest>
                  {formattedAmount}
                </BoldText>
              )}
              {!!formattedGroupPrice && (
                <BoldText small lightest>
                  {formattedGroupPrice}
                </BoldText>
              )}
              {!!description && (
                <RegularText small lightest>
                  {description}
                </RegularText>
              )}
              {!!maxAdultCount && (
                <RegularText small lightest>
                  {maxAdultCount} Erwachsene
                </RegularText>
              )}
              {!!maxChildrenCount && (
                <RegularText small lightest>
                  {maxChildrenCount} Kinder
                </RegularText>
              )}
            </PriceBox>
          );
        })}
    </WrapperWrap>
  </DiagonalGradient>
);

PriceCard.propTypes = {
  prices: PropTypes.array
};
