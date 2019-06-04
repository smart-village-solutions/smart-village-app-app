import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';

import { device, colors, normalize } from '../../config';
import { DiagonalGradient, WrapperPrice } from '../../components';

const PreiceBox = styled.View`
  background-color: #3f745f;
  width: ${device.width * 0.5 - normalize(14) * 1.5};
  margin-bottom: ${normalize(14)};
  flex-direction: column;
  padding: ${normalize(7)}px;
`;

const BoldText = styled.Text`
  color: ${colors.lightestText};
  font-family: titillium-web-bold;
  font-size: ${normalize(14)};
`;

const RegularText = styled(BoldText)`
  font-family: titillium-web-regular;
`;

export const PriceCard = ({ prices }) => (
  <DiagonalGradient style={{ padding: normalize(14) }}>
    <WrapperPrice>
      {!!prices &&
        prices.map((item, index) => {
          const {
            name,
            ageFrom,
            ageTo,
            category,
            amount,
            description,
            maxChildrenCount,
            maxAdultCount,
            minAdultCount,
            minChildrenCount,
            groupPrice
          } = item;

          return (
            <PreiceBox key={index}>
              {!!category && <BoldText>{category}</BoldText>}
              {!!description && <RegularText>{description}</RegularText>}
              {!!maxAdultCount && <RegularText>{maxAdultCount} Erwachsene</RegularText>}
              {!!maxChildrenCount && <RegularText>{maxChildrenCount} Kinder</RegularText>}
              {!!amount && <BoldText>EUR {amount}</BoldText>}
              {!!groupPrice && <BoldText>EUR {groupPrice}</BoldText>}
            </PreiceBox>
          );
        })}
    </WrapperPrice>
  </DiagonalGradient>
);

PriceCard.propTypes = {
  prices: PropTypes.array
};
