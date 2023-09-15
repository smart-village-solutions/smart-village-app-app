import PropTypes from 'prop-types';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import styled from 'styled-components/native';

import { normalize, colors } from '../../config';
import { momentFormat } from '../../helpers';
import { BoldText, RegularText } from '../Text';
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
/* NOTE: we need to check a lot for presence, so this is that complex */
export const OpeningTimesCard = ({ openingHours }) => (
  <Wrapper>
    {!!openingHours &&
      openingHours.map((item, index) => {
        const {
          weekday,
          timeFrom,
          timeTo,
          dateFrom,
          dateTo,
          description,
          open,
          useYear = false
        } = item;
        const returnFormatDate = useYear ? 'DD.MM.YYYY' : 'DD.MM.';

        return (
          <View key={index} style={index !== openingHours.length - 1 ? styles.divider : null}>
            {!!weekday && <BoldText style={styles.marginBottom}>{weekday}</BoldText>}

            {(!!timeFrom || !!timeTo || !!dateFrom || !!dateTo) && (
              <WrapperRow>
                {(open === undefined || open === true) && (!!timeFrom || !!timeTo) && (
                  <TimeBox>
                    {!!timeFrom && <RegularText>{timeFrom}</RegularText>}
                    {!!timeFrom && !!timeTo && <RegularText> -</RegularText>}
                    {!!timeTo && <RegularText> {timeTo}</RegularText>}
                  </TimeBox>
                )}
                {open === false && (
                  <TimeBox>
                    <RegularText>geschlossen</RegularText>
                  </TimeBox>
                )}
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
              </WrapperRow>
            )}

            {!!description && (
              <WrapperRow>
                <RegularText>{description}</RegularText>
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
  },
  marginBottom: {
    marginBottom: normalize(3)
  }
});

OpeningTimesCard.propTypes = {
  openingHours: PropTypes.array
};
