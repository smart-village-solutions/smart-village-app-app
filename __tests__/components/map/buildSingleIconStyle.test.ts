import { buildSingleIconStyle } from '../../../src/components/map/buildSingleIconStyle';

describe('buildSingleIconStyle', () => {
  it('adds white marker label text when labels are enabled', () => {
    expect(
      buildSingleIconStyle({
        labelStyles: {},
        ownLocationPin: 'ownLocationPin',
        selectedMarker: '2',
        showMarkerLabels: true,
        singleIconStyle: { iconAnchor: 'bottom', iconSize: 1.5 }
      })
    ).toMatchObject({
      textAnchor: 'center',
      textColor: '#ffffff',
      textField: ['get', 'label'],
      textFont: ['Noto Sans Bold', 'Open Sans Bold'],
      textOffset: [0, -2],
      textSize: 12
    });
  });

  it('sorts marker icons and labels together when marker sorting is enabled', () => {
    expect(
      buildSingleIconStyle({
        labelStyles: {},
        ownLocationPin: 'ownLocationPin',
        showMarkerLabels: true,
        sortMarkers: true,
        singleIconStyle: { iconAnchor: 'bottom', iconSize: 1.5 }
      })
    ).toMatchObject({
      symbolSortKey: ['get', 'sortKey'],
      symbolZOrder: 'source'
    });
  });
});
