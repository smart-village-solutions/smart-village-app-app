import { StackNavigationProp } from 'expo-router/js-stack';
import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';

import { consts, Icon, texts } from '../config';
import { QUERY_TYPES } from '../queries';
import { ScreenName } from '../types';
import { useTheme } from '../hooks/useTheme';

import { HEADER_RIGHT_ICON_SIZE, HEADER_RIGHT_ICON_STROKE_WIDTH } from './headerIconConfig';
import { HeaderIconButton } from './HeaderIconButton';

const { a11yLabel, ROOT_ROUTE_NAMES } = consts;

type Props = {
  navigation: StackNavigationProp<Record<string, object | undefined>>;
  style: StyleProp<ViewStyle>;
};

export const ChatHeader = ({ navigation, style }: Props) => {
  const { colors } = useTheme();

  return (
    <HeaderIconButton
      onPress={() =>
        navigation.navigate({
          name: ScreenName.VolunteerForm,
          params: {
            title: texts.volunteer.conversationStart,
            query: QUERY_TYPES.VOLUNTEER.CONVERSATION,
            rootRouteName: ROOT_ROUTE_NAMES.VOLUNTEER
          }
        })
      }
      accessibilityLabel={a11yLabel.chatIcon}
      accessibilityHint={a11yLabel.chatHint}
    >
      <Icon.Pen
        color={colors.darkText}
        style={style}
        size={HEADER_RIGHT_ICON_SIZE}
        strokeWidth={HEADER_RIGHT_ICON_STROKE_WIDTH}
      />
    </HeaderIconButton>
  );
};
