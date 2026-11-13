import { render } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';

jest.mock('../../src/config', () => ({ normalize: (value: number) => value }));
jest.mock('../../src/components/Text', () => ({
  RegularText: ({ children, ...props }: Record<string, unknown>) => {
    const { Text: NativeText } = jest.requireActual('react-native');
    return <NativeText {...props}>{children}</NativeText>;
  }
}));
jest.mock('../../src/components/Wrapper', () => ({
  WrapperRow: ({ children }: { children: React.ReactNode }) => children
}));

import { WidgetContent } from '../../src/components/widgets/WidgetContent';
import { WidgetLayoutContext } from '../../src/components/widgets/WidgetLayoutContext';
import { RegularText } from '../../src/components/Text';

describe('WidgetContent label measurements', () => {
  it('measures whole words using the label style without truncating the visible title', () => {
    const onLabelWidth = jest.fn();
    const labelStyle = { fontSize: 24 };
    const tree = render(
      <WidgetLayoutContext.Provider value={{ mode: 'grid', onLabelWidth }}>
        <WidgetContent label="Umfragen / Ankiety" labelStyle={labelStyle} visual={null} />
      </WidgetLayoutContext.Provider>
    );
    const measurement = tree
      .UNSAFE_getAllByType(RegularText)
      .find((node) => node.props.onTextLayout)!;
    expect(measurement.props.children).toBe('Umfragen\n/\nAnkiety');
    measurement.props.onTextLayout({
      nativeEvent: { lines: [{ width: 105.2 }, { width: 8 }, { width: 88 }] }
    });
    expect(onLabelWidth).toHaveBeenCalledWith(115);
    expect(measurement.props.style).toContainEqual({ fontSize: 24 });
    const visible = tree.getByText('Umfragen / Ankiety');
    expect(visible.props.numberOfLines).toBeUndefined();
    expect(visible.props.adjustsFontSizeToFit).toBeUndefined();
    expect(tree.UNSAFE_getAllByType(Text)).toHaveLength(2);
  });
});
