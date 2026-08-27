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

const weekdayLabels = [
  texts.noticeboard?.weekday?.monday,
  texts.noticeboard?.weekday?.tuesday,
  texts.noticeboard?.weekday?.wednesday,
  texts.noticeboard?.weekday?.thursday,
  texts.noticeboard?.weekday?.friday,
  texts.noticeboard?.weekday?.saturday,
  texts.noticeboard?.weekday?.sunday
];

const getReadableWeekday = (weekday) => {
  if (weekday === null || weekday === undefined || weekday === '') {
    return '';
  }

  if (typeof weekday === 'number' && weekday >= 0 && weekday < weekdayLabels.length) {
    return weekdayLabels[weekday] ?? weekday;
  }

  if (typeof weekday === 'string' && /^\d+$/.test(weekday)) {
    const weekdayIndex = Number(weekday);

    return weekdayLabels[weekdayIndex] ?? weekday;
  }

  return weekday;
};

const normalizeTimeLabel = (time) => time?.replace(/\s*Uhr\s*$/i, '').trim();

const formatTimeLabel = (time) => {
  const normalizedTime = normalizeTimeLabel(time);

  return normalizedTime ? `${normalizedTime} Uhr` : undefined;
};

const formatInlineDateTime = ({ dateFrom, datePrefix, dateTo, timeFrom, timeTo, useYear }) => {
  const returnFormatDate = useYear ? 'DD.MM.YYYY' : 'DD.MM.';
  const formattedDateFrom = dateFrom ? momentFormat(dateFrom, returnFormatDate) : undefined;
  const formattedDateTo = dateTo ? momentFormat(dateTo, returnFormatDate) : undefined;
  const normalizedTimeFrom = normalizeTimeLabel(timeFrom);
  const normalizedTimeTo = normalizeTimeLabel(timeTo);
  const startDate = [datePrefix, formattedDateFrom].filter(Boolean).join(' ');

  if (!dateTo || dateTo === dateFrom) {
    const timeRange =
      normalizedTimeFrom && normalizedTimeTo && normalizedTimeFrom !== normalizedTimeTo
        ? `${normalizedTimeFrom} - ${normalizedTimeTo} Uhr`
        : formatTimeLabel(normalizedTimeFrom || normalizedTimeTo);

    return [startDate, timeRange].filter(Boolean).join(' ');
  }

  const startDateTime = [startDate, formatTimeLabel(normalizedTimeFrom)].filter(Boolean).join(' ');
  const endDateTime = [formattedDateTo, formatTimeLabel(normalizedTimeTo)]
    .filter(Boolean)
    .join(' ');

  return [startDateTime, endDateTime].filter(Boolean).join(' bis ');
};

const isGroupableRecurringOpeningHour = ({ dateFrom, dateTo, open, timeFrom, timeTo, weekday }) =>
  weekday !== null &&
  weekday !== undefined &&
  weekday !== '' &&
  (!!timeFrom || !!timeTo) &&
  !dateFrom &&
  !dateTo &&
  open !== false;

const hasSameDescription = (openingHour, group) =>
  (openingHour.description || null) === (group.openingHours[0].description || null);

export const groupRecurringWeekdayOpeningHours = (openingHours) =>
  openingHours.reduce((groups, openingHour) => {
    const previousGroup = groups[groups.length - 1];
    const canJoinPreviousGroup =
      isGroupableRecurringOpeningHour(openingHour) &&
      previousGroup?.groupable &&
      previousGroup.weekday === openingHour.weekday &&
      hasSameDescription(openingHour, previousGroup);

    if (canJoinPreviousGroup) {
      previousGroup.openingHours.push(openingHour);
    } else {
      groups.push({
        groupable: isGroupableRecurringOpeningHour(openingHour),
        openingHours: [openingHour],
        weekday: openingHour.weekday
      });
    }

    return groups;
  }, []);

const createIndividualOpeningHourGroups = (openingHours) =>
  openingHours.map((openingHour) => ({
    openingHours: [openingHour],
    weekday: openingHour.weekday
  }));

/* eslint-disable complexity */
/* NOTE: we need to check a lot for presence, so this is that complex */
const OpeningHourDetails = ({ inlineDateTime, leftAligned, openingHour, styles }) => {
  const {
    dateFrom,
    datePrefix,
    dateTo,
    description,
    open,
    timeFrom,
    timeTo,
    useYear = false
  } = openingHour;
  const returnFormatDate = useYear ? 'DD.MM.YYYY' : 'DD.MM.';
  const hasDateOrTime = !!timeFrom || !!timeTo || !!dateFrom || !!dateTo;
  const showInlineDateTime = inlineDateTime && open !== false;

  return (
    <>
      {hasDateOrTime && showInlineDateTime && (
        <RegularText>
          {formatInlineDateTime({
            dateFrom,
            datePrefix,
            dateTo,
            timeFrom,
            timeTo,
            useYear
          })}
        </RegularText>
      )}

      {(hasDateOrTime || open === false) && !showInlineDateTime && (
        <WrapperRow accessible>
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
              <RegularText>{texts.accessibilityLabels.dropDownMenu.closed}</RegularText>
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
    </>
  );
};

export const OpeningTimesCard = ({
  appointmentsShowMoreButton = texts.eventRecord.appointmentsShowMoreButton,
  inlineDateTime = false,
  leftAligned = false,
  MAX_INITIAL_NUM_TO_RENDER = 15,
  openingHours,
  groupRecurringWeekdays = false
}) => {
  const styles = useThemeStyles(createStyles);
  const [moreData, setMoreData] = useState(1);
  const visibleOpeningHours = openingHours.slice(0, moreData * MAX_INITIAL_NUM_TO_RENDER);
  const openingHourGroups = groupRecurringWeekdays
    ? groupRecurringWeekdayOpeningHours(visibleOpeningHours)
    : createIndividualOpeningHourGroups(visibleOpeningHours);

  const loadMoreItems = () => {
    setMoreData((prev) => prev + 1);
  };

  return (
    <WrapperHorizontal>
      {openingHourGroups.map((group, index, groups) => {
        const readableWeekday = getReadableWeekday(group.weekday);

        return (
          <WrapperVertical
            key={group.openingHours[0].id ?? index}
            style={[
              index === 0 && styles.noMarginTop,
              index === 0 && styles.noPaddingTop,
              index !== groups.length - 1 && styles.divider,
              index === groups.length - 1 && styles.noPaddingBottom
            ]}
          >
            {!!readableWeekday && (
              <BoldText accessibilityRole="header" style={styles.marginBottom}>
                {readableWeekday}
              </BoldText>
            )}

            {group.openingHours.map((openingHour, openingHourIndex) => (
              <OpeningHourDetails
                inlineDateTime={inlineDateTime}
                key={openingHour.id ?? openingHourIndex}
                leftAligned={leftAligned}
                openingHour={openingHour}
                styles={styles}
              />
            ))}
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
  groupRecurringWeekdays: PropTypes.bool,
  inlineDateTime: PropTypes.bool,
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
      weekday: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
    })
  )
};

OpeningHourDetails.propTypes = {
  inlineDateTime: PropTypes.bool,
  leftAligned: PropTypes.bool,
  openingHour: PropTypes.object,
  styles: PropTypes.object
};
