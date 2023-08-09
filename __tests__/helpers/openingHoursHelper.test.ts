import { dateWithCorrectYear, getReadableDay, isOpen } from '../../src/helpers';
import { OpeningHour } from '../../src/types';

const FAKE_NOW_DATE = new Date();
FAKE_NOW_DATE.setHours(12);
FAKE_NOW_DATE.setMinutes(0);
FAKE_NOW_DATE.setSeconds(0);
FAKE_NOW_DATE.setMilliseconds(0);

const weekday = getReadableDay(FAKE_NOW_DATE);

const isOpenWithFakeTimeDateTime = (openingHours: OpeningHour[]) =>
  isOpen(openingHours, FAKE_NOW_DATE);

describe('testing correct year for date for TMB data', () => {
  it('not adjusted year for a date in 2022', () => {
    expect(dateWithCorrectYear('2022-05-19', true)).toEqual(new Date('2022-05-19'));
  });

  it('adjusted year for a date in the year that should be parsed', () => {
    const currentYear = FAKE_NOW_DATE.getFullYear();

    expect(dateWithCorrectYear('2020-03-09', false)).toEqual(new Date(`${currentYear}-03-09`));
  });
});

describe('testing the opening times handling', () => {
  it('single opening intervals work as expected', () => {
    expect(
      isOpenWithFakeTimeDateTime([
        {
          open: true,
          timeFrom: '16:00',
          timeTo: '17:00',
          weekday
        }
      ])
    ).toEqual({ open: false, timeDiff: 240 });

    expect(
      isOpenWithFakeTimeDateTime([
        {
          open: true,
          timeFrom: '10:00',
          timeTo: '17:00',
          weekday
        }
      ])
    ).toEqual({ open: true, timeDiff: 300 });

    expect(
      isOpenWithFakeTimeDateTime([
        {
          open: true,
          timeFrom: '10:00',
          timeTo: '11:00',
          weekday
        }
      ])
    ).toEqual({ open: false });

    expect(
      isOpenWithFakeTimeDateTime([
        {
          open: false,
          timeFrom: '16:00',
          timeTo: '17:00',
          weekday
        }
      ])
    ).toEqual({ open: false });

    expect(
      isOpenWithFakeTimeDateTime([
        {
          open: false,
          timeFrom: '10:00',
          timeTo: '17:00',
          weekday
        }
      ])
    ).toEqual({ open: false });

    expect(
      isOpenWithFakeTimeDateTime([
        {
          open: false,
          timeFrom: '10:00',
          timeTo: '11:00',
          weekday
        }
      ])
    ).toEqual({ open: false });

    expect(
      isOpenWithFakeTimeDateTime([
        {
          open: false,
          weekday
        }
      ])
    ).toEqual({ open: false });

    expect(
      isOpenWithFakeTimeDateTime([
        {
          open: true,
          weekday
        }
      ])
    ).toEqual({ open: true });
  });

  it('currently in closed interval and open interval', () => {
    // open interval is surrounding closed interval
    expect(
      isOpenWithFakeTimeDateTime([
        {
          open: false,
          timeFrom: '10:00',
          timeTo: '13:00',
          weekday
        },
        {
          open: true,
          timeFrom: '09:00',
          timeTo: '14:00',
          weekday
        }
      ])
    ).toEqual({ open: false, timeDiff: 60 });

    // closed interval is surrounding open interval
    expect(
      isOpenWithFakeTimeDateTime([
        {
          open: true,
          timeFrom: '10:00',
          timeTo: '13:00',
          weekday
        },
        {
          open: false,
          timeFrom: '09:00',
          timeTo: '14:00',
          weekday
        }
      ])
    ).toEqual({ open: false });
  });

  it('currently open, multiple opening times', () => {
    expect(
      isOpenWithFakeTimeDateTime([
        {
          open: true,
          timeFrom: '10:00',
          timeTo: '12:15',
          weekday
        },
        {
          open: true,
          timeFrom: '12:10',
          timeTo: '14:00',
          weekday
        },
        {
          open: false,
          timeFrom: '12:16',
          timeTo: '13:00',
          weekday
        }
      ])
    ).toEqual({ open: true, timeDiff: 16 });

    expect(
      isOpenWithFakeTimeDateTime([
        {
          open: true,
          timeFrom: '10:00',
          timeTo: '12:15',
          weekday
        },
        {
          open: true,
          timeFrom: '12:10',
          timeTo: '14:00',
          weekday
        }
      ])
    ).toEqual({ open: true, timeDiff: 120 });
  });

  it('currently closed, multiple opening and closed times', () => {
    expect(
      isOpenWithFakeTimeDateTime([
        {
          open: true,
          timeFrom: '10:00',
          timeTo: '12:15',
          weekday
        },
        {
          open: true,
          timeFrom: '12:10',
          timeTo: '14:00',
          weekday
        },
        {
          open: false,
          timeFrom: '12:16',
          timeTo: '13:00',
          weekday
        },
        {
          open: false,
          timeFrom: '11:00',
          timeTo: '12:06',
          weekday
        }
      ])
    ).toEqual({ open: false, timeDiff: 6 });

    expect(
      isOpenWithFakeTimeDateTime([
        {
          open: false,
          timeFrom: '10:00',
          timeTo: '12:15',
          weekday
        },
        {
          open: true,
          timeFrom: '12:10',
          timeTo: '15:00',
          weekday
        },
        {
          open: true,
          timeTo: '12:10',
          weekday
        },
        {
          open: false,
          timeFrom: '12:10',
          timeTo: '14:00',
          weekday
        }
      ])
    ).toEqual({ open: false, timeDiff: 120 });
  });

  it('currently open, with random entry without time and weekday', () => {
    expect(
      isOpenWithFakeTimeDateTime([
        {
          open: true,
          timeFrom: '10:00',
          timeTo: '17:00',
          weekday
        },
        {
          open: true
          // description: 'Betriebsurlaub'
        }
      ])
    ).toEqual({ open: true, timeDiff: 300 });

    expect(
      isOpenWithFakeTimeDateTime([
        {
          open: true,
          timeFrom: '10:00',
          timeTo: '17:00',
          weekday
        },
        {
          open: false
          // description: 'Ruhetag'
        }
      ])
    ).toEqual({ open: true, timeDiff: 300 });
  });

  it('currently closed, with random entry without time and weekday', () => {
    expect(
      isOpenWithFakeTimeDateTime([
        {
          open: false,
          timeFrom: '00:00',
          timeTo: '00:00',
          weekday
        },
        {
          open: true
          // description: 'Ruhetag'
        }
      ])
    ).toEqual({ open: false });
  });
});
