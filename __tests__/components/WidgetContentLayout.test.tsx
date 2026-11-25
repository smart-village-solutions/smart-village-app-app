import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

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
import { WrapperRow } from '../../src/components/Wrapper';

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
    fireEvent(measurement, 'textLayout', {
      nativeEvent: { lines: [{ width: 105.2 }, { width: 8 }, { width: 88 }] }
    });
    expect(onLabelWidth).toHaveBeenCalledWith(115);
    expect(measurement.props.style).toContainEqual({ fontSize: 24 });
    const visible = tree.getByText('Umfragen / Ankiety');
    expect(visible.props.numberOfLines).toBeUndefined();
    expect(visible.props.adjustsFontSizeToFit).toBeUndefined();
    expect(tree.UNSAFE_getAllByType(Text)).toHaveLength(2);
  });

  it('keeps a wide image above the label and permits list mode only when both fit inside the content width', () => {
    const tree = render(
      <WidgetLayoutContext.Provider value={{ mode: 'list' }}>
        <WidgetContent label="Baustellen" visual={<View />} />
      </WidgetLayoutContext.Provider>
    );
    const container = tree.UNSAFE_getAllByType(View).find((node) => node.props.onLayout)!;
    const measure = tree.UNSAFE_getAllByType(RegularText).find((node) => node.props.onTextLayout)!;
    fireEvent(container, 'layout', { nativeEvent: { layout: { width: 300 } } });
    fireEvent(measure, 'textLayout', { nativeEvent: { lines: [{ width: 160 }] } });
    fireEvent(tree.UNSAFE_getByType(WrapperRow), 'layout', {
      nativeEvent: { layout: { width: 140 } }
    });
    expect(StyleSheet.flatten(container.props.style).flexDirection).not.toBe('row');

    fireEvent(container, 'layout', { nativeEvent: { layout: { width: 340 } } });
    expect(StyleSheet.flatten(container.props.style).flexDirection).toBe('row');
    fireEvent(container, 'layout', { nativeEvent: { layout: { width: 312 } } });
    expect(StyleSheet.flatten(container.props.style).flexDirection).not.toBe('row');
  });

  it('rechecks scaled count/temperature and title measurements without getting stuck in list mode', () => {
    const tree = render(
      <WidgetLayoutContext.Provider value={{ mode: 'list', onLabelWidth: jest.fn() }}>
        <WidgetContent label="Wassertemperatur" visual={<Text>123°C</Text>} />
      </WidgetLayoutContext.Provider>
    );
    const container = tree.UNSAFE_getAllByType(View).find((node) => node.props.onLayout)!;
    const measure = tree.UNSAFE_getAllByType(RegularText).find((node) => node.props.onTextLayout)!;
    fireEvent(container, 'layout', { nativeEvent: { layout: { width: 300 } } });
    fireEvent(measure, 'textLayout', { nativeEvent: { lines: [{ width: 160 }] } });
    fireEvent(tree.UNSAFE_getByType(WrapperRow), 'layout', {
      nativeEvent: { layout: { width: 60 } }
    });
    expect(StyleSheet.flatten(container.props.style).flexDirection).toBe('row');

    fireEvent(tree.UNSAFE_getByType(WrapperRow), 'layout', {
      nativeEvent: { layout: { width: 140 } }
    });
    expect(StyleSheet.flatten(container.props.style).flexDirection).not.toBe('row');
    fireEvent(measure, 'textLayout', { nativeEvent: { lines: [{ width: 210 }] } });
    fireEvent(container, 'layout', { nativeEvent: { layout: { width: 400 } } });
    expect(StyleSheet.flatten(container.props.style).flexDirection).toBe('row');
  });
});
