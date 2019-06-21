import PropTypes from 'prop-types';
import React from 'react';
import { View, StyleSheet } from 'react-native';
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
/* eslint-disable complexity */
/* TODO: refactoring? */
export const OpeningTimesCard = ({ openingHours }) => (
  <Wrapper>
    {!!openingHours &&
      openingHours.map((item, index) => {
        const { weekday, timeFrom, timeTo, dateFrom, dateTo, description } = item;
        const returnFormat = 'HH:mm';
        const returnFormatDate = 'DD.MM.YYYY';

        return weekday ? (
          <View key={index} style={styles.divider}>
            <View>
              <BoldText style={{ marginBottom: normalize(3) }}>{weekday}</BoldText>
            </View>
            <WrapperRow style={{ justifyContent: 'space-between' }}>
              {(!!timeFrom || !!timeTo) && (
                <TimeBox>
                  {!!timeFrom && (
                    <RegularText>{momentFormat(timeFrom, returnFormat)} -</RegularText>
                  )}
                  {!!timeTo && <RegularText> {momentFormat(timeTo, returnFormat)} </RegularText>}
                </TimeBox>
              )}
              {(!!dateFrom || !!dateTo) && (
                <DateBox>
                  {!!dateFrom && (
                    <RegularText>
                      <RegularText small>von </RegularText>
                      {momentFormat(dateFrom, returnFormatDate)}{' '}
                    </RegularText>
                  )}

                  {!!dateTo && (
                    <RegularText>
                      <RegularText small>bis </RegularText>
                      {momentFormat(dateTo, returnFormatDate)}{' '}
                    </RegularText>
                  )}
                </DateBox>
              )}
            </WrapperRow>
            {!!description && <RegularText>{description}</RegularText>}
          </View>
        ) : (
          <WrapperRow key={index}>
            {(!!timeFrom || !!timeTo) && (
              <TimeBox>
                {!!timeFrom && <RegularText>{momentFormat(timeFrom, returnFormat)} -</RegularText>}
                {!!timeTo && <RegularText> {momentFormat(timeTo, returnFormat)} </RegularText>}
              </TimeBox>
            )}
            {(!!dateFrom || !!dateTo) && (
              <DateBox>
                {!!dateFrom && (
                  <RegularText>
                    <RegularText small>von </RegularText>
                    {momentFormat(dateFrom, returnFormatDate)}{' '}
                  </RegularText>
                )}

                {!!dateTo && (
                  <RegularText>
                    <RegularText small>bis </RegularText>
                    {momentFormat(dateTo, returnFormatDate)}{' '}
                  </RegularText>
                )}
              </DateBox>
            )}
            {!!description && <BoldText>{description}</BoldText>}
          </WrapperRow>
        );
      })}
  </Wrapper>
);
/* eslint-enable complexity */

const styles = StyleSheet.create({
  divider: {
    flex: 1,
    marginBottom: normalize(5),
    borderBottomWidth: 1,
    borderBottomColor: colors.primary
  }
});

OpeningTimesCard.propTypes = {
  openingHours: PropTypes.array
};
