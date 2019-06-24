import PropTypes from 'prop-types';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import styled from 'styled-components';

import { normalize, colors } from '../../config';
import { momentFormat } from '../../helpers';
import { BoldText, RegularText } from '../Text';
import { Wrapper, WrapperRow } from '../Wrapper';

const TimeBox = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  flex: 1;
  margin-bottom: 5;
`;

const DateBox = styled(TimeBox)`
  align-items: center;
  flex-direction: row;
  justify-content: center;
`;

/* eslint-disable complexity */
/* TODO: refactoring? */
export const OpeningTimesCard = ({ openingHours }) => (
  <Wrapper>
    {!!openingHours &&
      openingHours.map((item, index) => {
        const { weekday, timeFrom, timeTo, dateFrom, dateTo, description, open } = item;
        const returnFormatDate = 'DD.MM.YYYY';

        return weekday ? (
          <View key={index} style={styles.divider}>
            <BoldText style={styles.marginBottom}>{weekday}</BoldText>

            <WrapperRow space>
              {(!!timeFrom || !!timeTo) && (
                <TimeBox>
                  {!!timeFrom && <RegularText>{timeFrom}</RegularText>}
                  {!!timeFrom && !!timeTo && <RegularText> -</RegularText>}
                  {!!timeTo && <RegularText> {timeTo}</RegularText>}
                </TimeBox>
              )}
              {(!!dateFrom || !!dateTo) && (
                <DateBox>
                  {!!dateFrom && (
                    <RegularText>
                      <RegularText small>von </RegularText>
                      {momentFormat(dateFrom, returnFormatDate)}
                    </RegularText>
                  )}

                  {!!dateTo && (
                    <RegularText>
                      <RegularText small>bis </RegularText>
                      {momentFormat(dateTo, returnFormatDate)}
                    </RegularText>
                  )}
                </DateBox>
              )}
              {!!description && <RegularText>{description}</RegularText>}
            </WrapperRow>
          </View>
        ) : (
          <WrapperRow key={index}>
            {(!!timeFrom || !!timeTo) && (
              <TimeBox>
                {!!timeFrom && <RegularText>{timeFrom}</RegularText>}
                {!!timeFrom && !!timeTo && <RegularText> -</RegularText>}
                {!!timeTo && <RegularText> {timeTo}</RegularText>}
              </TimeBox>
            )}
            {(!!dateFrom || !!dateTo) && (
              <DateBox>
                {!!dateFrom && (
                  <RegularText>
                    <RegularText small>von </RegularText>
                    {momentFormat(dateFrom, returnFormatDate)}
                  </RegularText>
                )}

                {!!dateTo && (
                  <RegularText>
                    <RegularText small>bis </RegularText>
                    {momentFormat(dateTo, returnFormatDate)}
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
    borderBottomColor: colors.primary,
    borderBottomWidth: 1,
    flex: 1,
    marginBottom: normalize(5)
  },
  marginBottom: {
    marginBottom: normalize(3)
  }
});

OpeningTimesCard.propTypes = {
  openingHours: PropTypes.array
};
