import {
  DEFAULT_TOUR_STOP_INITIAL_MAP_MIN_ZOOM,
  resolveTourStopInitialMapMinZoom
} from '../../../src/components/map/resolveTourStopInitialMapMinZoom';

describe('resolveTourStopInitialMapMinZoom', () => {
  test.each([
    [undefined, DEFAULT_TOUR_STOP_INITIAL_MAP_MIN_ZOOM],
    [{}, DEFAULT_TOUR_STOP_INITIAL_MAP_MIN_ZOOM],
    [{ locationService: {} }, DEFAULT_TOUR_STOP_INITIAL_MAP_MIN_ZOOM],
    [{ locationService: { tours: {} } }, DEFAULT_TOUR_STOP_INITIAL_MAP_MIN_ZOOM],
    [{ locationService: { tours: { initialMapMinZoom: 15 } } }, 15],
    [{ locationService: { tours: { initialMapMinZoom: 0 } } }, 0],
    [{ locationService: { tours: { initialMapMinZoom: 18 } } }, 18],
    [
      { locationService: { tours: { initialMapMinZoom: -1 } } },
      DEFAULT_TOUR_STOP_INITIAL_MAP_MIN_ZOOM
    ],
    [
      { locationService: { tours: { initialMapMinZoom: 19 } } },
      DEFAULT_TOUR_STOP_INITIAL_MAP_MIN_ZOOM
    ],
    [
      { locationService: { tours: { initialMapMinZoom: '15' } } },
      DEFAULT_TOUR_STOP_INITIAL_MAP_MIN_ZOOM
    ],
    [
      { locationService: { tours: { initialMapMinZoom: Number.NaN } } },
      DEFAULT_TOUR_STOP_INITIAL_MAP_MIN_ZOOM
    ],
    [
      { locationService: { tours: { initialMapMinZoom: Number.POSITIVE_INFINITY } } },
      DEFAULT_TOUR_STOP_INITIAL_MAP_MIN_ZOOM
    ]
  ])('resolves settings %p to %p', (settings, expected) => {
    expect(resolveTourStopInitialMapMinZoom(settings)).toBe(expected);
  });
});
