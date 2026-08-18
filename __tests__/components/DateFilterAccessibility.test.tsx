import React from 'react';
import { TouchableOpacity } from 'react-native';
import renderer from 'react-test-renderer';

let mockCalendarHeaderProps: Record<string, unknown> = {};

jest.mock('react-native-calendars', () => {
  const ReactLocal = require('react');
  const { View } = require('react-native');

  return {
    Calendar: ({ customHeader: CustomHeader, testID }) => (
      <View testID={testID}>
        {CustomHeader ? (
          <CustomHeader
            {...mockCalendarHeaderProps}
            month={{ toString: () => 'Juli 2026' }}
            testID={`${testID}.header`}
          />
        ) : null}
      </View>
    )
  };
});

jest.mock('react-native-collapsible', () => ({ children }) => children);

jest.mock('../../src/config', () => {
  const ReactLocal = require('react');

  const MockIcon = () => ReactLocal.createElement('mock-icon');

  return {
    colors: {
      calendarSelected: '#2288cc',
      calendarSelectedDayText: '#ffffff',
      calendarTodayText: '#2288cc',
      darkText: '#2d4150',
      gray40: '#cccccc',
      placeholder: '#d9e1e8',
      refreshControl: '#2288cc'
    },
    consts: {
      CALENDAR: {
        DOT_SIZE: 8
      },
      a11yLabel: {
        button: '(Taste)'
      }
    },
    device: {
      platform: 'ios'
    },
    Icon: {
      ArrowLeft: MockIcon,
      ArrowRight: MockIcon,
      Calendar: MockIcon
    },
    normalize: (value: number) => value,
    texts: {
      accessibilityLabels: {
        actions: {
          nextMonth: 'Nächster Monat',
          previousMonth: 'Vorheriger Monat',
          selectDate: 'Datum auswählen'
        }
      },
      filter: {
        date: 'Datum'
      }
    }
  };
});

jest.mock('../../src/helpers', () => ({
  getCalendarTheme: (colors: Record<string, string>) => ({
    arrowColor: colors.primary,
    calendarBackground: colors.calendarBackground,
    dayTextColor: colors.text,
    monthTextColor: colors.text,
    textDisabledColor: colors.placeholder
  }),
  momentFormat: (value: string) => value,
  updateFilters: ({ currentFilters }: { currentFilters: Record<string, unknown> }) => currentFilters
}));

jest.mock('../../src/components/Label', () => ({
  Label: ({ children }) => children
}));

jest.mock('../../src/components/Text', () => ({
  RegularText: ({ children }) => children
}));

jest.mock('../../src/components/Wrapper', () => ({
  WrapperRow: ({ children }) => children
}));

jest.mock('../../src/components/calendarArrows', () => ({
  renderArrow: () => null
}));

import { DateFilter } from '../../src/components/filter/DateFilter';

const renderWithAct = (component: React.ReactElement) => {
  let testRenderer: renderer.ReactTestRenderer;

  renderer.act(() => {
    testRenderer = renderer.create(component);
  });

  return testRenderer!;
};

describe('DateFilter accessibility', () => {
  beforeEach(() => {
    mockCalendarHeaderProps = {
      addMonth: jest.fn()
    };
  });

  it('adds contextual labels and button semantics to start and end date controls', () => {
    const tree = renderWithAct(
      <DateFilter
        data={[
          {
            hasFutureDates: false,
            hasPastDates: true,
            name: 'start_date',
            placeholder: 'Von'
          },
          {
            hasFutureDates: false,
            hasPastDates: true,
            name: 'end_date',
            placeholder: 'Bis'
          }
        ]}
        filters={{}}
        setFilters={jest.fn()}
      />
    );

    const buttons = tree.root.findAllByType(TouchableOpacity);

    const startButton = buttons.find(
      (button) => button.props.accessibilityLabel === 'Startdatum auswählen (Taste)'
    );
    const endButton = buttons.find(
      (button) => button.props.accessibilityLabel === 'Enddatum auswählen (Taste)'
    );

    expect(startButton).toBeDefined();
    expect(startButton?.props.accessibilityRole).toBe('button');
    expect(endButton).toBeDefined();
    expect(endButton?.props.accessibilityRole).toBe('button');
  });

  it('exposes previous and next month as separate buttons in the calendar header', () => {
    const tree = renderWithAct(
      <DateFilter
        data={[
          {
            hasFutureDates: false,
            hasPastDates: true,
            name: 'start_date',
            placeholder: 'Von'
          }
        ]}
        filters={{}}
        setFilters={jest.fn()}
      />
    );

    const buttons = tree.root.findAllByType(TouchableOpacity);

    expect(buttons.map((button) => button.props.accessibilityLabel)).toContain(
      'Vorheriger Monat (Taste)'
    );
    expect(buttons.map((button) => button.props.accessibilityLabel)).toContain(
      'Nächster Monat (Taste)'
    );
  });

  it('keeps original arrow behavior for month navigation and disabled states', () => {
    const onPressArrowLeft = jest.fn((method) => method());
    const onPressArrowRight = jest.fn((method) => method());
    const addMonth = jest.fn();

    mockCalendarHeaderProps = {
      addMonth,
      disableArrowLeft: true,
      onPressArrowLeft,
      onPressArrowRight
    };

    const tree = renderWithAct(
      <DateFilter
        data={[
          {
            hasFutureDates: false,
            hasPastDates: true,
            name: 'start_date',
            placeholder: 'Von'
          }
        ]}
        filters={{}}
        setFilters={jest.fn()}
      />
    );

    const previousButton = tree.root.findAllByType(TouchableOpacity).find(
      (button) => button.props.accessibilityLabel === 'Vorheriger Monat (Taste)'
    );
    const nextButton = tree.root.findAllByType(TouchableOpacity).find(
      (button) => button.props.accessibilityLabel === 'Nächster Monat (Taste)'
    );

    expect(previousButton).toBeDefined();
    expect(previousButton?.props.disabled).toBe(true);
    expect(nextButton).toBeDefined();
    expect(nextButton?.props.disabled).toBe(false);

    renderer.act(() => {
      nextButton?.props.onPress();
    });

    expect(onPressArrowRight).toHaveBeenCalledTimes(1);
    expect(addMonth).toHaveBeenCalledWith(1);
    expect(onPressArrowLeft).not.toHaveBeenCalled();
  });
});
