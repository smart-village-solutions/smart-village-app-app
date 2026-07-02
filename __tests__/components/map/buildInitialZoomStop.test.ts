import { buildInitialZoomStop } from '../../../src/components/map/buildInitialZoomStop';

describe('buildInitialZoomStop', () => {
  it('returns a MapLibre v11 stop config for the initial zoom', () => {
    expect(buildInitialZoomStop(14)).toEqual({
      duration: 600,
      easing: 'easeTo',
      zoom: 14
    });
  });
});
