import {
  formatSpeechDates,
  normalizeSpeechText
} from '../../src/helpers/accessibility/speechTextFormatter';

describe('speechTextFormatter helpers', () => {
  it('formats backend date-time strings for speech', () => {
    expect(formatSpeechDates('Erstellt am 2026-03-31 11:09:56 +0200')).toBe(
      'Erstellt am 31.03.2026 11:09 Uhr'
    );
  });

  it('formats dates after removing html from speech text', () => {
    expect(normalizeSpeechText('<p>Gültig bis 2026-03-31</p>')).toBe('Gültig bis 31.03.2026');
  });
});
