import { texts } from '../../src/config';

describe('text', () => {
  it('for home screen title is defined', () => {
    expect(texts.screenTitles.home).toBeTruthy();
  });
});
