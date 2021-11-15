import { getReadableDay, isOpen } from '../../src/helpers';

const todayString = getReadableDay(new Date());

const FAKE_NOW_DATE = new Date();
FAKE_NOW_DATE.setHours(12);
FAKE_NOW_DATE.setMinutes(0);
FAKE_NOW_DATE.setSeconds(0);
FAKE_NOW_DATE.setMilliseconds(0);

const isOpenWithFakeTimeDateTime = (openingHours) => isOpen(openingHours, FAKE_NOW_DATE);

describe('testing the opening times handling', () => {
  test('single opening intervals work as expected', () => {
    expect(
      isOpenWithFakeTimeDateTime([
        {
          open: true,
          timeFrom: '16:00',
          timeTo: '17:00',
          weekday: todayString
        }
      ]).open
    ).toEqual(false);
    expect(
      isOpenWithFakeTimeDateTime([
        {
          open: true,
          timeFrom: '10:00',
          timeTo: '17:00',
          weekday: todayString
        }
      ])
    ).toEqual({ open: true, timeDiff: 300 });
    expect(
      isOpenWithFakeTimeDateTime([
        {
          open: true,
          timeFrom: '10:00',
          timeTo: '11:00',
          weekday: todayString
        }
      ]).open
    ).toEqual(false);
    expect(
      isOpenWithFakeTimeDateTime([
        {
          open: false,
          timeFrom: '16:00',
          timeTo: '17:00',
          weekday: todayString
        }
      ]).open
    ).toEqual(false);
    expect(
      isOpenWithFakeTimeDateTime([
        {
          open: false,
          timeFrom: '10:00',
          timeTo: '17:00',
          weekday: todayString
        }
      ]).open
    ).toEqual(false);
    expect(
      isOpenWithFakeTimeDateTime([
        {
          open: false,
          timeFrom: '10:00',
          timeTo: '11:00',
          weekday: todayString
        }
      ]).open
    ).toEqual(false);
  });

  test('currently in closed interval and open interval', () => {
    // open interval is surrounding closed interval
    expect(
      isOpenWithFakeTimeDateTime([
        {
          open: false,
          timeFrom: '10:00',
          timeTo: '13:00',
          weekday: todayString
        },
        {
          open: true,
          timeFrom: '09:00',
          timeTo: '14:00',
          weekday: todayString
        }
      ]).open
    ).toEqual(false);

    // closed interval is surrounding open interval
    expect(
      isOpenWithFakeTimeDateTime([
        {
          open: true,
          timeFrom: '10:00',
          timeTo: '13:00',
          weekday: todayString
        },
        {
          open: false,
          timeFrom: '09:00',
          timeTo: '14:00',
          weekday: todayString
        }
      ]).open
    ).toEqual(false);
  });

  test('currently open, multiple opening times', () => {
    expect(
      isOpenWithFakeTimeDateTime([
        {
          open: true,
          timeFrom: '10:00',
          timeTo: '12:15',
          weekday: todayString
        },
        {
          open: true,
          timeFrom: '12:10',
          timeTo: '14:00',
          weekday: todayString
        },
        {
          open: false,
          timeFrom: '12:16',
          timeTo: '13:00',
          weekday: todayString
        }
      ])
    ).toEqual({ open: true, timeDiff: 16 });

    expect(
      isOpenWithFakeTimeDateTime([
        {
          open: true,
          timeFrom: '10:00',
          timeTo: '12:15',
          weekday: todayString
        },
        {
          open: true,
          timeFrom: '12:10',
          timeTo: '14:00',
          weekday: todayString
        }
      ])
    ).toEqual({ open: true, timeDiff: 120 });
  });

  test('currently closed, multiple opening and closed times', () => {
    expect(
      isOpenWithFakeTimeDateTime([
        {
          open: true,
          timeFrom: '10:00',
          timeTo: '12:15',
          weekday: todayString
        },
        {
          open: true,
          timeFrom: '12:10',
          timeTo: '14:00',
          weekday: todayString
        },
        {
          open: false,
          timeFrom: '12:16',
          timeTo: '13:00',
          weekday: todayString
        },
        {
          open: false,
          timeFrom: '11:00',
          timeTo: '12:06',
          weekday: todayString
        }
      ])
    ).toEqual({ open: false, timeDiff: 6 });

    expect(
      isOpenWithFakeTimeDateTime([
        {
          open: false,
          timeFrom: '10:00',
          timeTo: '12:15',
          weekday: todayString
        },
        {
          open: true,
          timeFrom: '12:10',
          timeTo: '15:00',
          weekday: todayString
        },
        {
          open: true,
          timeTo: '12:10',
          weekday: todayString
        },
        {
          open: false,
          timeFrom: '12:10',
          timeTo: '14:00',
          weekday: todayString
        }
      ])
    ).toEqual({ open: false, timeDiff: 120 });
  });
});
