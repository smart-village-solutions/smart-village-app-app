import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { render } from '@testing-library/react-native';

import { ConfigurationsContext } from '../../src/ConfigurationsProvider';
import { SueStatus } from '../../src/components/SUE/SueStatus';

jest.mock('../../src/config', () => ({
  normalize: (value: number) => value,
  device: { width: 360 },
  Icon: {},
  texts: {}
}));
jest.mock('../../src/helpers/storageHelper', () => ({ storageHelper: {} }));
jest.mock('../../src/ConfigurationsProvider', () => ({
  ConfigurationsContext: jest
    .requireActual<typeof React>('react')
    .createContext({ appDesignSystem: {} })
}));
jest.mock('../../src/hooks/useTheme', () => ({
  useTheme: () => ({ colors: { primary: '#e87840' } })
}));
jest.mock('../../src/components/Text', () => ({
  BoldText: jest.requireActual<typeof import('react-native')>('react-native').Text,
  RegularText: jest.requireActual<typeof import('react-native')>('react-native').Text
}));
jest.mock('../../src/components/Wrapper', () => ({
  WrapperRow: jest.requireActual<typeof import('react-native')>('react-native').View
}));

describe('SueStatus tags', () => {
  it('renders all tags without truncation using the customer theme border', () => {
    const longTag = 'Keine Kategorie der Melde.Möwe - Meldung wurde weitergegeben';
    const screen = render(
      <SueStatus status="In Bearbeitung" tagName={` Weitergeleitet ;${longTag}; `} />
    );

    expect(screen.getByText('In Bearbeitung')).toBeTruthy();
    expect(screen.getByText('Weitergeleitet')).toBeTruthy();
    const tagText = screen.getByText(longTag);
    expect(tagText.props.numberOfLines).toBeUndefined();
    const tag = screen
      .UNSAFE_getAllByType(View)
      .find((view) => StyleSheet.flatten(view.props.style)?.borderWidth === 1);
    expect(StyleSheet.flatten(tag?.props.style)).toMatchObject({
      borderColor: '#e87840',
      maxWidth: '100%'
    });
    expect(screen.UNSAFE_getAllByType(Text)).toHaveLength(3);
  });

  it('renders tags even when no status is available', () => {
    const screen = render(<SueStatus tagName="Weitergeleitet" />);
    expect(screen.getByText('Weitergeleitet')).toBeTruthy();
  });

  it('keeps the original badge without adding a tags row when tags are absent', () => {
    const screen = render(<SueStatus status="Geschlossen" />);
    expect(screen.getByText('Geschlossen')).toBeTruthy();
    expect(screen.UNSAFE_getAllByType(View)).toHaveLength(1);
  });
});

describe('SUE label font metrics', () => {
  afterEach(() => jest.restoreAllMocks());

  const useAndroidStyles = () =>
    jest
      .spyOn(Platform, 'select')
      .mockImplementation((styles) => (styles.android ?? styles.default)!);

  it('uses Android font metrics for tags and regular status badges', () => {
    useAndroidStyles();
    const screen = render(<SueStatus status="In Bearbeitung" tagName="Rückfrage" />);
    expect(StyleSheet.flatten(screen.getByText('Rückfrage').props.style) || {}).toHaveProperty(
      'lineHeight',
      undefined
    );
    expect(StyleSheet.flatten(screen.getByText('In Bearbeitung').props.style) || {}).toHaveProperty(
      'lineHeight',
      undefined
    );
  });

  it('also fixes regular Android status badges without tags', () => {
    useAndroidStyles();
    const screen = render(<SueStatus status="In Bearbeitung" />);
    expect(StyleSheet.flatten(screen.getByText('In Bearbeitung').props.style) || {}).toHaveProperty(
      'lineHeight',
      undefined
    );
  });

  it.each([{ small: true }, { isFilter: true }])(
    'preserves Android compact and filter typography: %p',
    (props) => {
      useAndroidStyles();
      const screen = render(<SueStatus status="In Bearbeitung" {...props} />);
      expect(
        StyleSheet.flatten(screen.getByText('In Bearbeitung').props.style) || {}
      ).not.toHaveProperty('lineHeight');
    }
  );

  it('preserves an explicitly configured customer status line height', () => {
    useAndroidStyles();
    const screen = render(
      <ConfigurationsContext.Provider
        value={
          {
            appDesignSystem: { sueStatus: { textStyle: { lineHeight: 24 } } }
          } as React.ContextType<typeof ConfigurationsContext>
        }
      >
        <SueStatus status="In Bearbeitung" />
      </ConfigurationsContext.Provider>
    );
    expect(StyleSheet.flatten(screen.getByText('In Bearbeitung').props.style)).toHaveProperty(
      'lineHeight',
      24
    );
  });

  it('does not override iOS line heights', () => {
    jest.spyOn(Platform, 'select').mockImplementation((styles) => styles.default!);
    const screen = render(<SueStatus status="In Bearbeitung" tagName="Rückfrage" />);
    expect(StyleSheet.flatten(screen.getByText('Rückfrage').props.style) || {}).not.toHaveProperty(
      'lineHeight'
    );
    expect(
      StyleSheet.flatten(screen.getByText('In Bearbeitung').props.style) || {}
    ).not.toHaveProperty('lineHeight');
  });
});
