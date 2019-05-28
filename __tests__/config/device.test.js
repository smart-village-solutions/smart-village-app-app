import { device } from '../../src/config';

describe('device config', () => {
  it('for height is defined', () => {
    expect(device.height).toBeTruthy();
  });

  it('for platform is defined', () => {
    expect(device.platform).toBeTruthy();
  });

  it('for width is defined', () => {
    expect(device.width).toBeTruthy();
  });
});
