import PropTypes from 'prop-types';
import React from 'react';
import { View } from 'react-native';
import styled from 'styled-components';

import { normalize } from '../../config';
import { momentFormat } from '../../helpers';
import { BoldText, RegularText } from '../Text';
import { WrapperRow } from '../Wrapper';

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
              <BoldText>{weekday}</BoldText>
              <View>
                {!!timeFrom && <RegularText>{momentFormat(timeFrom, returnFormat)}</RegularText>}
                {!!timeTo && <RegularText>--</RegularText>}
                {!!timeTo && <RegularText>{momentFormat(timeTo, returnFormat)}</RegularText>}
              </View>
              {/* {!!description && <BoldText>{description}</BoldText>} */}
            </DayTimeBox>
          )
        );
      })}
  </WrapperRow>
);

TimeCard.propTypes = {
  openingHours: PropTypes.array
};
