import PropTypes from 'prop-types';
import React from 'react';
import { View } from 'react-native';
import styled from 'styled-components';

import { normalize, colors } from '../../config';
import { momentFormat } from '../../helpers';
import { BoldText, RegularText } from '../Text';
import { Wrapper, WrapperRow } from '../Wrapper';

const TimeBox = styled.View`
  flex: 1;
  flex-direction: row;
  flex-wrap: wrap;
  margin-bottom: 5;
`;

const DateBox = styled(TimeBox)`
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;

export const OpeningTimesCard = ({ openingHours }) => (
  <Wrapper>
    {!!openingHours &&
      openingHours.map((item, index) => {
        const { weekday, timeFrom, timeTo, dateFrom, dateTo, description } = item;
        const returnFormat = 'HH:mm';
        const returnFormatDate = 'DD.MM.YYYY';

        return weekday ? (
          <View key={index}>
            <View style={{ flex: 1, marginBottom: 7 }}>
              <BoldText>{weekday}</BoldText>
            </View>
            <WrapperRow style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              {(!!timeFrom || !!timeTo) && (
                <TimeBox>
                  {!!timeFrom && <RegularText>{momentFormat(timeFrom, returnFormat)} </RegularText>}
                  {!!timeTo && <BoldText>-</BoldText>}
                  {!!timeTo && <RegularText> {momentFormat(timeTo, returnFormat)} </RegularText>}
                </TimeBox>
              )}
              {(!!dateFrom || !!dateTo) && (
                <DateBox>
                  {!!dateFrom && (
                    <RegularText>
                      <BoldText small>von </BoldText>
                      {momentFormat(dateFrom, returnFormatDate)}{' '}
                    </RegularText>
                  )}

                  {!!dateTo && (
                    <RegularText>
                      <BoldText small>bis </BoldText>
                      {momentFormat(dateTo, returnFormatDate)}{' '}
                    </RegularText>
                  )}
                </DateBox>
              )}
            </WrapperRow>
            {!!description && <RegularText>{description}</RegularText>}
          </View>
        ) : (
          <Wrapper key={index}>
            {(!!timeFrom || !!timeTo) && (
              <TimeBox>
                {!!timeFrom && <RegularText>{momentFormat(timeFrom, returnFormat)} </RegularText>}
                {!!timeTo && <BoldText>-</BoldText>}
                {!!timeTo && <RegularText> {momentFormat(timeTo, returnFormat)} </RegularText>}
              </TimeBox>
            )}
            {(!!dateFrom || !!dateTo) && (
              <DateBox>
                {!!dateFrom && (
                  <RegularText>{momentFormat(dateFrom, returnFormatDate)} </RegularText>
                )}
                {!!dateTo && <BoldText>/</BoldText>}
                {!!dateTo && <RegularText>{momentFormat(dateTo, returnFormatDate)} </RegularText>}
              </DateBox>
            )}
            {!!description && <BoldText>{description}</BoldText>}
          </Wrapper>
        );
      })}
  </Wrapper>
);

OpeningTimesCard.propTypes = {
  openingHours: PropTypes.array
};
