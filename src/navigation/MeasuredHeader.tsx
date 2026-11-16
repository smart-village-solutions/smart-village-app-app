import { HeaderBackButton, HeaderTitle } from 'expo-router/build/react-navigation/elements';
import { Header, type StackHeaderProps } from 'expo-router/build/react-navigation/stack';
import React, { useCallback, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const renderBackButton = (props: React.ComponentProps<typeof HeaderBackButton>) => (
  <HeaderBackButton {...props} />
);

const getTitleLayout = (width: number, left: number, right: number) => {
  const available = Math.max(0, width - left - right - 32);
  const centered = Math.max(0, width - 2 * (Math.max(left, right) + 16));
  // Keep centered titles where possible, then use the remaining space between controls.
  return centered >= Math.min(80, available)
    ? { maxWidth: centered, align: 'center' as const }
    : { maxWidth: available, align: 'left' as const };
};

const AndroidHeader = (props: StackHeaderProps) => {
  const { options, layout, back } = props;
  const insets = useSafeAreaInsets();
  const [leftWidth, setLeftWidth] = useState<number>();
  const [rightWidth, setRightWidth] = useState<number>();
  const renderLeft =
    options.headerLeft === undefined && back ? renderBackButton : options.headerLeft;
  const renderRight = options.headerRight;
  const left = renderLeft ? leftWidth : 0;
  const right = renderRight ? rightWidth : 0;
  const titleLayout =
    left === undefined || right === undefined
      ? { maxWidth: 0, align: 'center' as const }
      : getTitleLayout(layout.width, left + insets.left, right + insets.right);
  const renderTitle = options.headerTitle;
  const measuredLeft = useCallback(
    (buttonProps: React.ComponentProps<typeof HeaderBackButton>) => (
      <View
        style={styles.actions}
        onLayout={({ nativeEvent }) => setLeftWidth(nativeEvent.layout.width)}
      >
        {renderLeft?.(buttonProps)}
      </View>
    ),
    [renderLeft]
  );
  const measuredRight = useCallback(
    (buttonProps: Parameters<NonNullable<StackHeaderProps['options']['headerRight']>>[0]) => (
      <View
        style={styles.actions}
        onLayout={({ nativeEvent }) => setRightWidth(nativeEvent.layout.width)}
      >
        {renderRight?.(buttonProps)}
      </View>
    ),
    [renderRight]
  );
  const truncatedTitle = useCallback(
    (titleProps: React.ComponentProps<typeof HeaderTitle>) => (
      <HeaderTitle
        {...titleProps}
        style={[titleProps.style, options.headerTitleStyle]}
        numberOfLines={1}
        ellipsizeMode="tail"
        accessibilityLabel={typeof renderTitle === 'string' ? renderTitle : titleProps.children}
      >
        {typeof renderTitle === 'string' ? renderTitle : titleProps.children}
      </HeaderTitle>
    ),
    [renderTitle, options.headerTitleStyle]
  );

  return (
    <Header
      {...props}
      options={{
        ...options,
        headerLeft: renderLeft ? measuredLeft : renderLeft,
        headerRight: renderRight ? measuredRight : undefined,
        headerTitleAlign: titleLayout.align,
        headerTitleContainerStyle: [
          options.headerTitleContainerStyle,
          { maxWidth: titleLayout.maxWidth }
        ],
        headerTitle: typeof renderTitle === 'function' ? renderTitle : truncatedTitle
      }}
    />
  );
};

// Keep the existing iOS header layout and transition behavior untouched.
export const MeasuredHeader = (props: StackHeaderProps) =>
  Platform.OS === 'android' ? <AndroidHeader {...props} /> : <Header {...props} />;

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0
  }
});
