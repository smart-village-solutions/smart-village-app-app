import { HeaderBackButton, HeaderTitle } from 'expo-router/build/react-navigation/elements';
import { Header, type StackHeaderProps } from 'expo-router/build/react-navigation/stack';
import React, { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AndroidHeader = (props: StackHeaderProps) => {
  const { options, layout, back } = props;
  const insets = useSafeAreaInsets();
  const [leftWidth, setLeftWidth] = useState<number>();
  const [rightWidth, setRightWidth] = useState<number>();
  const renderLeft =
    options.headerLeft === undefined && back
      ? (buttonProps: React.ComponentProps<typeof HeaderBackButton>) => (
          <HeaderBackButton {...buttonProps} />
        )
      : options.headerLeft;
  const renderRight = options.headerRight;
  const left = renderLeft ? leftWidth : 0;
  const right = renderRight ? rightWidth : 0;
  // The navigation header adds 16 points of horizontal margin around centered titles.
  // Reserve both sides symmetrically so centering never moves text underneath an action.
  const maxWidth =
    left === undefined || right === undefined
      ? 0
      : Math.max(0, layout.width - 2 * (Math.max(left + insets.left, right + insets.right) + 16));
  const renderTitle = options.headerTitle;

  return (
    <Header
      {...props}
      options={{
        ...options,
        headerLeft: renderLeft
          ? (buttonProps) => (
              <View
                style={styles.actions}
                onLayout={({ nativeEvent }) => setLeftWidth(nativeEvent.layout.width)}
              >
                {renderLeft(buttonProps)}
              </View>
            )
          : renderLeft,
        headerRight: renderRight
          ? (buttonProps) => (
              <View
                style={styles.actions}
                onLayout={({ nativeEvent }) => setRightWidth(nativeEvent.layout.width)}
              >
                {renderRight(buttonProps)}
              </View>
            )
          : undefined,
        headerTitleContainerStyle: [options.headerTitleContainerStyle, { maxWidth }],
        headerTitle:
          typeof renderTitle === 'function'
            ? renderTitle
            : (titleProps) => (
                <HeaderTitle
                  {...titleProps}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  accessibilityLabel={renderTitle ?? titleProps.children}
                >
                  {renderTitle ?? titleProps.children}
                </HeaderTitle>
              )
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
