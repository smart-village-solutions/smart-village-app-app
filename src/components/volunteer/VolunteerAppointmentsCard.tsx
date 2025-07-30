import moment from 'moment';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import styled from 'styled-components/native';

import { colors, normalize } from '../../config';
import { momentFormat } from '../../helpers';
import { RegularText } from '../Text';
import { Wrapper, WrapperRow } from '../Wrapper';

const TimeBox = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  flex: 1;
  margin-bottom: ${normalize(5)}px;
`;

const DateBox = styled.View`
  align-items: flex-end;
  flex-direction: column;
  flex-wrap: wrap;
  flex: 1;
`;

/* eslint-disable complexity */
export const VolunteerAppointmentsCard = ({
  appointments
}: {
  appointments: {
    allDay: boolean;
    dateFrom: string;
    dateTo: string;
    timeFrom: string;
    timeTo: string;
  }[];
}) => (
  <Wrapper>
    {appointments?.map((item, index) => {
      const { allDay, dateFrom, dateTo, timeFrom, timeTo } = item;
      const returnFormatDate = 'DD.MM.YYYY';
      const fullDay = allDay || (timeFrom === '00:00' && timeTo === '00:00');

      return (
        <View key={index} style={index !== appointments.length - 1 ? styles.divider : null}>
          {(!!timeFrom || !!timeTo || !!dateFrom || !!dateTo) && (
            <WrapperRow>
              {(!!dateFrom || !!dateTo) && (
                <DateBox>
                  {!!dateFrom && (
                    <RegularText>
                      <RegularText small />
                      {momentFormat(dateFrom, returnFormatDate)}
                    </RegularText>
                  )}

                  {!!dateTo && dateTo !== dateFrom && (
                    <RegularText>
                      <RegularText small>bis </RegularText>
                      {momentFormat(
                        fullDay ? moment(dateTo).subtract(1, 'day').format('YYYY-MM-DD') : dateTo,
                        returnFormatDate
                      )}
                    </RegularText>
                  )}
                </DateBox>
              )}
              {!fullDay && (!!timeFrom || !!timeTo) && (
                <TimeBox>
                  {!!timeFrom && <RegularText>{timeFrom}</RegularText>}
                  {!!timeFrom && !!timeTo && <RegularText> -</RegularText>}
                  {!!timeTo && <RegularText> {timeTo}</RegularText>}
                </TimeBox>
              )}
            </WrapperRow>
          )}
        </View>
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
  }
});
