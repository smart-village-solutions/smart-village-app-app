import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import styled from 'styled-components/native';

import { colors, normalize, texts } from '../../config';
import { momentFormat } from '../../helpers';
import { HtmlView } from '../HtmlView';
import { BoldText, RegularText } from '../Text';
import { Touchable } from '../Touchable';
import { WrapperHorizontal, WrapperRow, WrapperVertical } from '../Wrapper';

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
export const OpeningTimesCard = ({
  openingHours,
  MAX_INITIAL_NUM_TO_RENDER = 15,
  appointmentsShowMoreButton = texts.eventRecord.appointmentsShowMoreButton
}) => {
  const [moreData, setMoreData] = useState(1);

  const loadMoreItems = () => {
    setMoreData((prev) => prev + 1);
  };

  return (
    <WrapperHorizontal>
      {openingHours
        .slice(0, moreData * MAX_INITIAL_NUM_TO_RENDER)
        .map((item, index, slicedArray) => {
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
            <WrapperVertical
              key={index}
              style={[
                index === 0 && styles.noMarginTop,
                index === 0 && styles.noPaddingTop,
                index !== slicedArray.length - 1 && styles.divider,
                index === slicedArray.length - 1 && styles.noPaddingBottom
              ]}
            >
              {!!weekday && <BoldText style={styles.marginBottom}>{weekday}</BoldText>}

              {(!!timeFrom || !!timeTo || !!dateFrom || !!dateTo) && (
                <WrapperRow>
                  {(open === undefined || open === true) && (!!timeFrom || !!timeTo) && (
                    <TimeBox>
                      {!!timeFrom && <RegularText>{timeFrom}</RegularText>}
                      {!!timeFrom && !!timeTo && timeFrom !== timeTo && (
                        <>
                          <RegularText> -</RegularText>
                          <RegularText> {timeTo}</RegularText>
                        </>
                      )}
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
                <WrapperRow style={styles.marginBottom}>
                  <HtmlView html={description} />
                </WrapperRow>
              )}
            </WrapperVertical>
          );
        })}

      {moreData * MAX_INITIAL_NUM_TO_RENDER < openingHours.length && (
        <Touchable onPress={loadMoreItems}>
          <BoldText primary underline center>
            {appointmentsShowMoreButton}
          </BoldText>
        </Touchable>
      )}
    </WrapperHorizontal>
  );
};
/* eslint-enable complexity */

const styles = StyleSheet.create({
  divider: {
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  marginBottom: {
    marginBottom: normalize(3)
  },
  noMarginTop: {
    marginTop: 0
  },
  noPaddingBottom: {
    paddingBottom: 0
  },
  noPaddingTop: {
    paddingTop: 0
  }
});

OpeningTimesCard.propTypes = {
  openingHours: PropTypes.array
};
