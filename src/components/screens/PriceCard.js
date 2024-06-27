import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components/native';

import { colors, device, normalize } from '../../config';
import { priceFormat } from '../../helpers';
import { BoldText, RegularText } from '../Text';
import { WrapperHorizontal, WrapperWrap } from '../Wrapper';

const PriceBox = styled.View`
  background-color: ${colors.lighterPrimary};
  flex-direction: column;
  margin-bottom: ${normalize(14)}px;
  padding: ${normalize(7)}px;
  width: ${device.width * 0.5 - normalize(14) * 1.5};
`;

export const PriceCard = ({ prices }) => (
  <WrapperHorizontal>
    <WrapperWrap spaceBetween>
      {!!prices &&
        prices.map((item, index) => {
          const { category, amount, description, maxChildrenCount, maxAdultCount } = item;
          const formattedAmount = priceFormat(amount);

          return (
            <PriceBox key={index}>
              {!!category && <BoldText small>{category}</BoldText>}
              {!!formattedAmount && <BoldText small>{formattedAmount}</BoldText>}
              {!!description && <RegularText small>{description}</RegularText>}
              {!!maxAdultCount && <RegularText small>{maxAdultCount} Erwachsene</RegularText>}
              {!!maxChildrenCount && <RegularText small>{maxChildrenCount} Kinder</RegularText>}
            </PriceBox>
          );
        })}
    </WrapperWrap>
  </WrapperHorizontal>
);

PriceCard.propTypes = {
  prices: PropTypes.array
};
