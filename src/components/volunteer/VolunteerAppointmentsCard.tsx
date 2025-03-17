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

const DateBox = styled(TimeBox)`
  align-items: flex-end;
  flex-direction: column;
`;

/* eslint-disable complexity */
export const VolunteerAppointmentsCard = ({
  appointments
}: {
  appointments: { dateFrom: string; dateTo: string; timeFrom: string; timeTo: string }[];
}) => (
  <Wrapper>
    {appointments?.map((item, index) => {
      const { dateFrom, dateTo, timeFrom, timeTo } = item;
      const returnFormatDate = 'DD.MM.YYYY';
      const fullDay = timeFrom === '00:00' && timeTo === '00:00';

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
                      {momentFormat(dateTo, returnFormatDate)}
                    </RegularText>
                  )}
                </DateBox>
              )}
              {(!!timeFrom || !!timeTo) && !fullDay && (
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
