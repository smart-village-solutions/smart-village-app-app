import { parseColorToHex } from '../../src/helpers';

describe('parsing different color formats into 6 digit hex format', () => {
  it('does not alter 6 digit hex format', () => {
    const testValue = '#001f20';
    const expectedValue = testValue;

    expect(parseColorToHex(testValue)).toEqual(expectedValue);
  });

  it('does correctly transform 3 digit hex format into 6 digit hex format', () => {
    const testValue = '#01f';
    const expectedValue = '#0011ff';

    expect(parseColorToHex(testValue)).toEqual(expectedValue);
  });

  it('does correctly transform rgb format into 6 digit hex format', () => {
    const testValue = 'rgb(0,13,200)';
    const expectedValue = '#000dc8';

    expect(parseColorToHex(testValue)).toEqual(expectedValue);
  });

  it('does correctly transform rgb format with varying whitespace into 6 digit hex format', () => {
    const testValue = 'rgb( 0 ,13  , 200 )';
    const expectedValue = '#000dc8';

    expect(parseColorToHex(testValue)).toEqual(expectedValue);
  });
});
