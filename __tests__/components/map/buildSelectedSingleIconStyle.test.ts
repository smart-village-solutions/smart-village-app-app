import { buildSelectedSingleIconStyle } from '../../../src/components/map/buildSelectedSingleIconStyle';

describe('buildSelectedSingleIconStyle', () => {
  it('uses the active label style for selected markers', () => {
    expect(
      buildSelectedSingleIconStyle({
        labelStyles: {},
        ownLocationPin: 'ownLocationPin',
        showMarkerLabels: true,
        singleIconStyle: { iconAnchor: 'bottom', iconSize: 1.5 }
      })
    ).toMatchObject({
      textAnchor: 'center',
      textColor: '#000000',
      textField: ['get', 'label'],
      textFont: ['Noto Sans Bold', 'Open Sans Bold'],
      textOffset: [0, -2],
      textSize: 14
    });
  });
});
