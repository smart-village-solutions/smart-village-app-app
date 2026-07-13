import { buildInitialViewState } from '../../../src/components/map/buildInitialViewState';

describe('buildInitialViewState', () => {
  it('uses bounds and padding without center or zoom when bounds are provided', () => {
    const initialViewState = buildInitialViewState({
      bounds: [13.2, 52.4, 13.8, 52.6],
      latitude: 51,
      longitude: 10,
      zoom: 8
    });

    expect(initialViewState).toEqual({
      bounds: [13.2, 52.4, 13.8, 52.6],
      padding: { top: 50, right: 50, bottom: 50, left: 50 }
    });
    expect(initialViewState).not.toHaveProperty('center');
    expect(initialViewState).not.toHaveProperty('zoom');
  });

  it('falls back to center and zoom without bounds', () => {
    expect(buildInitialViewState({ latitude: 51, longitude: 10, zoom: 8 })).toEqual({
      center: [10, 51],
      zoom: 8
    });
  });
});
