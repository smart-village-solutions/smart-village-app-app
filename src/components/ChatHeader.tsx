import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { StyleProp, TouchableOpacity, ViewStyle } from 'react-native';

import { colors, consts, Icon, normalize, texts } from '../config';
import { QUERY_TYPES } from '../queries';
import { ScreenName } from '../types';

const { a11yLabel, ROOT_ROUTE_NAMES } = consts;

type Props = {
  navigation: StackNavigationProp<any>;
  style: StyleProp<ViewStyle>;
};

export const ChatHeader = ({ navigation, style }: Props) => (
  <TouchableOpacity
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
    <Icon.Pen color={colors.darkText} style={style} size={normalize(20)} />
  </TouchableOpacity>
);
