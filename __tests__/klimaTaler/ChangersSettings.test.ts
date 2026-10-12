import { createConfiguration } from '../../src/klimaTaler/createConfiguration';
import { isKlimaTalerConfigured, klimaTalerWidgets } from '../../src/klimaTaler/settings';

test('only the nested settings key controls activation and automatic widget visibility', () => {
  const rootOnly = { 'klima-taler': true };
  expect(isKlimaTalerConfigured(rootOnly)).toBe(false);
  expect(klimaTalerWidgets(rootOnly, ['weather', 'klimaTaler'])).toEqual(['weather']);
  expect(isKlimaTalerConfigured({ ...rootOnly, settings: { 'klima-taler': false } })).toBe(false);
  expect(isKlimaTalerConfigured({ 'klima-taler': false, settings: { 'klima-taler': {} } })).toBe(
    true
  );
  expect(isKlimaTalerConfigured({ settings: null })).toBe(false);
});

test.each([true, {}, { text: 'Mein Klima-Taler' }])(
  'enables true and object configuration: %j',
  (value) => {
    expect(isKlimaTalerConfigured({ settings: { 'klima-taler': value } })).toBe(true);
  }
);

test.each([undefined, null, false, 0, 1, 'true', []])(
  'does not enable missing or invalid values: %j',
  (value) => {
    expect(isKlimaTalerConfigured({ settings: { 'klima-taler': value } })).toBe(false);
  }
);

test('provides a default entry, preserves explicit placement and removes disabled widgets', () => {
  expect(klimaTalerWidgets({ settings: { 'klima-taler': true } })).toEqual([
    { widgetName: 'klimaTaler' }
  ]);
  expect(
    klimaTalerWidgets({ settings: { 'klima-taler': { text: 'Mein Klima' } } }, ['weather'])
  ).toEqual(['weather', { widgetName: 'klimaTaler' }]);
  const widgets = ['weather', { widgetName: 'klimaTaler', text: 'Custom' }, 'event'];
  expect(klimaTalerWidgets({ settings: { 'klima-taler': {} } }, widgets)).toEqual(widgets);
  expect(klimaTalerWidgets({}, [...widgets, 'klimaTaler'])).toEqual(['weather', 'event']);
});

test('rapid configuration changes are applied in order and gate entry immediately', async () => {
  let finish!: () => void;
  const native = jest
    .fn()
    .mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        })
    )
    .mockResolvedValue(undefined);
  const configuration = createConfiguration(native);
  configuration.setEnabled(true);
  await Promise.resolve();
  await Promise.resolve();
  configuration.setEnabled(false);
  expect(configuration.isEnabled()).toBe(false);
  finish();
  await configuration.ready();
  expect(native.mock.calls).toEqual([[true], [false]]);
  configuration.setEnabled(false);
  await configuration.ready();
  expect(native).toHaveBeenCalledTimes(2);
});

test('a transient native failure can be retried without changing settings', async () => {
  const native = jest
    .fn()
    .mockRejectedValueOnce(new Error('temporary'))
    .mockResolvedValue(undefined);
  const configuration = createConfiguration(native);
  configuration.setEnabled(true);
  await expect(configuration.ready()).rejects.toThrow('temporary');
  await configuration.ready();
  expect(native.mock.calls).toEqual([[true], [true]]);
});
