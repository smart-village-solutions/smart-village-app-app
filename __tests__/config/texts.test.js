import { texts } from '../../src/config';

describe('text', () => {
  it('for back button is defined', () => {
    expect(texts.button.back).toBeTruthy();
  });

  it('for home button is defined', () => {
    expect(texts.button.home).toBeTruthy();
  });

  it('for share button is defined', () => {
    expect(texts.button.share).toBeTruthy();
  });
});
