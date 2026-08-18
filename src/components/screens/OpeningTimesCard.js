import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import styled, { css } from 'styled-components/native';

import { normalize, texts } from '../../config';
import { momentFormat } from '../../helpers';
import { HtmlView } from '../HtmlView';
import { BoldText, RegularText } from '../Text';
import { Touchable } from '../Touchable';
import { WrapperHorizontal, WrapperRow, WrapperVertical } from '../Wrapper';
import { useThemeStyles } from '../../hooks/useThemeStyles';

const TimeBox = styled.View`
  flex-direction: row;
  flex: 1;
`;

const DateBox = styled(TimeBox)`
  align-items: flex-end;
  flex-direction: column;

  ${(props) =>
    props.leftAligned &&
    css`
      align-items: flex-start;
    `};
`;

/* eslint-disable complexity */
/* NOTE: we need to check a lot for presence, so this is that complex */
export const OpeningTimesCard = ({
  appointmentsShowMoreButton = texts.eventRecord.appointmentsShowMoreButton,
  leftAligned = false,
  MAX_INITIAL_NUM_TO_RENDER = 15,
  openingHours
}) => {
  const styles = useThemeStyles(createStyles);
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
            datePrefix,
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
                  {open !== false && (!!timeFrom || !!timeTo) && (
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
                    <DateBox leftAligned={leftAligned}>
                      {!!dateFrom && (
                        <RegularText>
                          {!!datePrefix && <RegularText small>{datePrefix} </RegularText>}
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
                <WrapperRow style={styles.margin}>
                  <HtmlView html={description} />
                </WrapperRow>
              )}
            </WrapperVertical>
          );
        })}

      {moreData * MAX_INITIAL_NUM_TO_RENDER < openingHours.length && (
        <WrapperVertical style={styles.noPaddingBottom}>
          <Touchable
            accessibilityLabel={texts.accessibilityLabels.actions.loadMore}
            onPress={loadMoreItems}
          >
            <BoldText primary underline center>
              {appointmentsShowMoreButton}
            </BoldText>
          </Touchable>
        </WrapperVertical>
      )}
    </WrapperHorizontal>
  );
};
/* eslint-enable complexity */

const createStyles = (colors) => ({
  divider: {
    borderBottomColor: colors.gray60,
    borderBottomWidth: StyleSheet.hairlineWidth
  },

  margin: {
    marginBottom: normalize(3),
    marginTop: normalize(5)
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
  appointmentsShowMoreButton: PropTypes.string,
  leftAligned: PropTypes.bool,
  MAX_INITIAL_NUM_TO_RENDER: PropTypes.number,
  openingHours: PropTypes.arrayOf(
    PropTypes.shape({
      dateFrom: PropTypes.string,
      datePrefix: PropTypes.string,
      dateTo: PropTypes.string,
      description: PropTypes.string,
      open: PropTypes.bool,
      timeFrom: PropTypes.string,
      timeTo: PropTypes.string,
      useYear: PropTypes.bool,
      weekday: PropTypes.string
    })
  )
};
