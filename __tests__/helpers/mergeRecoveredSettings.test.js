import { mergeRecoveredSettings } from '../../src/helpers/mergeRecoveredSettings';

it('applies server configuration while retaining local edits and deletions', () => {
  const previous = { navigation: 'tab', settings: { removed: true, local: false }, waste: {} };
  const current = { ...previous, settings: { local: true }, waste: { streetId: 42 } };
  const incoming = {
    navigation: 'drawer',
    settings: { removed: false, local: false, server: true },
    waste: {}
  };

  expect(mergeRecoveredSettings(previous, current, incoming)).toEqual({
    navigation: 'drawer',
    settings: { local: true, server: true },
    waste: { streetId: 42 }
  });
});

it('replaces unchanged arrays but preserves user-edited arrays', () => {
  const previous = { widgets: ['weather'] };
  const incoming = { widgets: ['weather', 'events'] };

  expect(mergeRecoveredSettings(previous, previous, incoming)).toEqual(incoming);
  expect(mergeRecoveredSettings(previous, { widgets: ['custom'] }, incoming)).toEqual({
    widgets: ['custom']
  });
});
