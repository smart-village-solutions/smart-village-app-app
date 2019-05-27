import { styles } from '../../../src/config';

describe('html styles', () => {
  it('for p is defined', () => {
    expect(styles.html.p).toBeTruthy();
  });

  it('for a is defined', () => {
    expect(styles.html.a).toBeTruthy();
  });

  it('for h1 is defined', () => {
    expect(styles.html.h1).toBeTruthy();
  });

  it('for h2 is defined', () => {
    expect(styles.html.h2).toBeTruthy();
  });

  it('for h3 is defined', () => {
    expect(styles.html.h3).toBeTruthy();
  });

  it('for h4 is defined', () => {
    expect(styles.html.h4).toBeTruthy();
  });

  it('for h5 is defined', () => {
    expect(styles.html.h5).toBeTruthy();
  });

  it('for h6 is defined', () => {
    expect(styles.html.h6).toBeTruthy();
  });

  it('for b is defined', () => {
    expect(styles.html.b).toBeTruthy();
  });

  it('for strong is defined', () => {
    expect(styles.html.strong).toBeTruthy();
  });

  it('for ul is defined', () => {
    expect(styles.html.ul).toBeTruthy();
  });

  it('for ol is defined', () => {
    expect(styles.html.ol).toBeTruthy();
  });
});
