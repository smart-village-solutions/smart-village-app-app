/* eslint-disable @typescript-eslint/no-var-requires, react/prop-types */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';

import {
  groupRecurringWeekdayOpeningHours,
  OpeningTimesCard
} from '../../src/components/screens/OpeningTimesCard';
import { isOpeningTimesGroupingEnabled } from '../../src/components/screens/openingTimesSettings';

jest.mock('../../src/config', () => ({
  normalize: (value) => value,
  texts: {
    accessibilityLabels: {
      actions: {
        loadMore: 'Weitere Einträge laden'
      },
      dropDownMenu: {
        closed: 'geschlossen'
      }
    },
    eventRecord: {
      appointmentsShowMoreButton: 'Weitere Termine'
    },
    noticeboard: {
      weekday: {
        friday: 'Freitag',
        monday: 'Montag',
        saturday: 'Samstag',
        sunday: 'Sonntag',
        thursday: 'Donnerstag',
        tuesday: 'Dienstag',
        wednesday: 'Mittwoch'
      }
    }
  }
}));

jest.mock('../../src/helpers', () => ({
  momentFormat: (value) => {
    const [year, month, day] = `${value}`.slice(0, 10).split('-');

    return `${day}.${month}.${year}`;
  }
}));

jest.mock('../../src/hooks/useThemeStyles', () => ({
  useThemeStyles: (createStyles) => createStyles({ gray60: '#999999' })
}));

jest.mock('../../src/components/HtmlView', () => ({
  HtmlView: ({ html }) => {
    const { Text: MockText } = require('react-native');

    return <MockText>{html}</MockText>;
  }
}));

jest.mock('../../src/components/Text', () => {
  const ReactInMock = require('react');
  const { Text: MockText } = require('react-native');
  const TextComponent = ({ children, ...props }) =>
    ReactInMock.createElement(MockText, props, children);

  return { BoldText: TextComponent, RegularText: TextComponent };
});

jest.mock('../../src/components/Touchable', () => {
  const ReactInMock = require('react');
  const { View: MockView } = require('react-native');

  return {
    Touchable: ({ children, ...props }) => ReactInMock.createElement(MockView, props, children)
  };
});

jest.mock('../../src/components/Wrapper', () => {
  const ReactInMock = require('react');
  const { View: MockView } = require('react-native');
  const WrapperComponent = ({ children, ...props }) =>
    ReactInMock.createElement(MockView, props, children);

  return {
    WrapperHorizontal: WrapperComponent,
    WrapperRow: WrapperComponent,
    WrapperVertical: WrapperComponent
  };
});

const mondayMorning = {
  id: 'monday-morning',
  open: true,
  timeFrom: '08:00',
  timeTo: '12:00',
  weekday: 'Montag'
};

const mondayAfternoon = {
  id: 'monday-afternoon',
  open: true,
  timeFrom: '13:00',
  timeTo: '17:00',
  weekday: 'Montag'
};

const tuesdayMorning = {
  id: 'tuesday-morning',
  open: true,
  timeFrom: '09:00',
  timeTo: '11:00',
  weekday: 'Dienstag'
};

const collectText = (node, values = []) => {
  if (typeof node === 'string') {
    values.push(node);
    return values;
  }

  if (Array.isArray(node)) {
    node.forEach((child) => collectText(child, values));
    return values;
  }

  if (node?.children) {
    node.children.forEach((child) => collectText(child, values));
  }

  return values;
};

const getHeaderTexts = (component) =>
  component
    .UNSAFE_getAllByType(Text)
    .filter((node) => node.props.accessibilityRole === 'header')
    .map((node) => collectText(node.props.children).join(''));

const getDividerCount = (component) =>
  component.UNSAFE_getAllByType(View).filter((node) => {
    const style = StyleSheet.flatten(node.props.style);

    return style?.borderBottomWidth === StyleSheet.hairlineWidth;
  }).length;

describe('isOpeningTimesGroupingEnabled', () => {
  it('keeps the legacy view by default', () => {
    expect(isOpeningTimesGroupingEnabled()).toBe(false);
    expect(isOpeningTimesGroupingEnabled({})).toBe(false);
    expect(isOpeningTimesGroupingEnabled({ openingTimes: {} })).toBe(false);
  });

  it('only enables grouping for an explicit boolean true setting', () => {
    expect(isOpeningTimesGroupingEnabled({ openingTimes: { groupByWeekday: true } })).toBe(true);
    expect(isOpeningTimesGroupingEnabled({ openingTimes: { groupByWeekday: false } })).toBe(false);
    expect(isOpeningTimesGroupingEnabled({ openingTimes: { groupByWeekday: 'true' } })).toBe(false);
  });
});

describe('groupRecurringWeekdayOpeningHours', () => {
  it('groups adjacent recurring time windows while preserving their backend order', () => {
    const groups = groupRecurringWeekdayOpeningHours([mondayMorning, mondayAfternoon]);

    expect(groups).toHaveLength(1);
    expect(groups[0].weekday).toBe('Montag');
    expect(groups[0].openingHours).toEqual([mondayMorning, mondayAfternoon]);
  });

  it('supports numeric weekday values introduced on the target branch', () => {
    const numericMondayMorning = { ...mondayMorning, weekday: 0 };
    const numericMondayAfternoon = { ...mondayAfternoon, weekday: 0 };
    const groups = groupRecurringWeekdayOpeningHours([
      numericMondayMorning,
      numericMondayAfternoon
    ]);

    expect(groups).toHaveLength(1);
    expect(groups[0].openingHours).toEqual([numericMondayMorning, numericMondayAfternoon]);
  });

  it('keeps different weekdays and closed entries in independent groups', () => {
    const closedMonday = { id: 'closed-monday', open: false, weekday: 'Montag' };
    const groups = groupRecurringWeekdayOpeningHours([mondayMorning, closedMonday, tuesdayMorning]);

    expect(groups.map((group) => group.openingHours)).toEqual([
      [mondayMorning],
      [closedMonday],
      [tuesdayMorning]
    ]);
  });

  it('does not group date-related special openings by weekday', () => {
    const specialOpening = {
      dateFrom: '2026-08-31',
      dateTo: '2026-08-31',
      description: 'Sonderöffnung',
      id: 'special-opening',
      open: true,
      timeFrom: '18:00',
      timeTo: '20:00',
      weekday: 'Montag'
    };
    const groups = groupRecurringWeekdayOpeningHours([mondayMorning, specialOpening]);

    expect(groups).toHaveLength(2);
    expect(groups[1].openingHours).toEqual([specialOpening]);
  });

  it('keeps recurring entries with different descriptions in independent groups', () => {
    const appointmentOnly = {
      ...mondayAfternoon,
      description: 'Nur nach Vereinbarung'
    };
    const groups = groupRecurringWeekdayOpeningHours([mondayMorning, appointmentOnly]);

    expect(groups).toHaveLength(2);
    expect(groups[1].openingHours).toEqual([appointmentOnly]);
  });
});

describe('OpeningTimesCard', () => {
  it('renders one weekday heading and no internal divider for multiple Monday windows', () => {
    const component = render(
      <OpeningTimesCard groupRecurringWeekdays openingHours={[mondayMorning, mondayAfternoon]} />
    );
    const renderedText = collectText(component.toJSON());
    const accessibleRows = component
      .UNSAFE_getAllByType(View)
      .filter((node) => node.props.accessible);

    expect(getHeaderTexts(component)).toEqual(['Montag']);
    expect(renderedText.indexOf('08:00')).toBeLessThan(renderedText.indexOf('13:00'));
    expect(accessibleRows).toHaveLength(2);
    expect(getDividerCount(component)).toBe(0);
  });

  it('keeps different weekdays visually separated', () => {
    const component = render(
      <OpeningTimesCard
        groupRecurringWeekdays
        openingHours={[mondayMorning, mondayAfternoon, tuesdayMorning]}
      />
    );

    expect(getHeaderTexts(component)).toEqual(['Montag', 'Dienstag']);
    expect(getDividerCount(component)).toBe(1);
  });

  it('keeps a single time window unchanged when grouping is enabled', () => {
    const grouped = render(
      <OpeningTimesCard groupRecurringWeekdays openingHours={[mondayMorning]} />
    );
    const ungrouped = render(<OpeningTimesCard openingHours={[mondayMorning]} />);

    expect(grouped.toJSON()).toEqual(ungrouped.toJSON());
  });

  it('does not group open and closed entries and keeps the closed state explicit', () => {
    const component = render(
      <OpeningTimesCard
        groupRecurringWeekdays
        openingHours={[mondayMorning, { id: 'closed-monday', open: false, weekday: 'Montag' }]}
      />
    );

    expect(getHeaderTexts(component)).toEqual(['Montag', 'Montag']);
    expect(component.getByText('geschlossen')).toBeTruthy();
    expect(getDividerCount(component)).toBe(1);
  });

  it('preserves special-opening dates and descriptions in their own section', () => {
    const component = render(
      <OpeningTimesCard
        groupRecurringWeekdays
        openingHours={[
          mondayMorning,
          {
            dateFrom: '2026-08-31',
            dateTo: '2026-08-31',
            description: 'Nur nach Vereinbarung',
            id: 'special-opening',
            open: true,
            timeFrom: '18:00',
            timeTo: '20:00',
            weekday: 'Montag'
          }
        ]}
      />
    );

    expect(getHeaderTexts(component)).toEqual(['Montag', 'Montag']);
    expect(component.getByText('31.08.2026')).toBeTruthy();
    expect(component.getByText('Nur nach Vereinbarung')).toBeTruthy();
  });

  it('merges a weekday across the load-more boundary without losing entries', () => {
    const component = render(
      <OpeningTimesCard
        groupRecurringWeekdays
        MAX_INITIAL_NUM_TO_RENDER={1}
        openingHours={[mondayMorning, mondayAfternoon, tuesdayMorning]}
      />
    );

    expect(getHeaderTexts(component)).toEqual(['Montag']);

    fireEvent.press(component.getByText('Weitere Termine'));

    expect(getHeaderTexts(component)).toEqual(['Montag']);
    expect(component.getByText('08:00')).toBeTruthy();
    expect(component.getByText('13:00')).toBeTruthy();

    fireEvent.press(component.getByText('Weitere Termine'));

    expect(getHeaderTexts(component)).toEqual(['Montag', 'Dienstag']);
    expect(component.getByText('09:00')).toBeTruthy();
    expect(component.queryByText('Weitere Termine')).toBeNull();
  });

  it('keeps grouping disabled for other OpeningTimesCard consumers by default', () => {
    const component = render(<OpeningTimesCard openingHours={[mondayMorning, mondayAfternoon]} />);

    expect(getHeaderTexts(component)).toEqual(['Montag', 'Montag']);
    expect(getDividerCount(component)).toBe(1);
  });

  it('renders the date before the start time with one clock suffix', () => {
    const component = render(
      <OpeningTimesCard
        inlineDateTime
        openingHours={[
          {
            dateFrom: '2026-09-01',
            open: true,
            timeFrom: '18:30 Uhr',
            useYear: true
          }
        ]}
      />
    );

    expect(component.getByText('01.09.2026 18:30 Uhr')).toBeTruthy();
  });

  it('keeps date ranges readable when no time is available', () => {
    const component = render(
      <OpeningTimesCard
        inlineDateTime
        openingHours={[
          {
            dateFrom: '2026-08-14',
            dateTo: '2026-09-18',
            open: true,
            useYear: true
          }
        ]}
      />
    );

    expect(component.getByText('14.08.2026 bis 18.09.2026')).toBeTruthy();
  });
});
