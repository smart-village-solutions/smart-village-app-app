import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { render } from '@testing-library/react-native';

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
