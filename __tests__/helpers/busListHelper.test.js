import { formatBusCategoryDescription } from '../../src/helpers/busListHelper';

describe('formatBusCategoryDescription', () => {
  it.each([
    ['<p>Vor der Geburt</p><p>Nach der Geburt</p>', 'Vor der Geburt Nach der Geburt'],
    ['<ul><li>Eltern</li><li>Kinder</li></ul>', 'Eltern Kinder'],
    ['Eltern\nund<br />Kinder', 'Eltern und Kinder'],
    ['<p>Eltern &amp; Kinder&nbsp;&#252;ber &#xDF;</p>', 'Eltern & Kinder über ß'],
    ['Ein <strong>wichtiges</strong> Thema', 'Ein wichtiges Thema'],
    ['Normaler Text', 'Normaler Text'],
    ['<strong></strong>', ''],
    [null, undefined],
    [undefined, undefined]
  ])('converts %p to readable list text', (description, expected) => {
    expect(formatBusCategoryDescription(description)).toBe(expected);
  });
});
