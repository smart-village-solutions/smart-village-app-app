import React from 'react';
import styled from 'styled-components';
import { View } from 'react-native';
import PropTypes from 'prop-types';

import { normalize } from '../../config';
import { WrapperRow } from '../../components';
import { BoldText, RegularText } from './PriceCard';
import { momentFormat } from '../../helpers';

const DayTimeBox = styled.View`
  flex: 1;
  flex-direction: column;
  padding: ${normalize(5)}px;
`;

export const TimeCard = ({ openingHours }) => (
  <WrapperRow style={{ padding: normalize(14) }}>
    {!!openingHours &&
      openingHours.map((item, index) => {
        const { weekday, timeFrom, timeTo, description } = item;
        const returnFormat = 'HH:mm';

        return (
          !!weekday && (
            <DayTimeBox key={index}>
              <BoldText onTimeCard>{weekday}</BoldText>
              <View>
                {!!timeFrom && (
                  <RegularText onTimeCard>{momentFormat(timeFrom, returnFormat)}</RegularText>
                )}
                {!!timeTo && <RegularText onTimeCard>--</RegularText>}
                {!!timeTo && (
                  <RegularText onTimeCard>{momentFormat(timeTo, returnFormat)}</RegularText>
                )}
              </View>
              {/* {!!description && <BoldText onTimeCard>{description}</BoldText>} */}
            </DayTimeBox>
          )
        );
      })}
  </WrapperRow>
);

TimeCard.propTypes = {
  openingHours: PropTypes.array
};
