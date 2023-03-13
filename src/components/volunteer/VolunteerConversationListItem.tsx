import { StackNavigationProp } from '@react-navigation/stack';
import PropTypes from 'prop-types';
import React, { memo, NamedExoticComponent, Validator } from 'react';
import { StyleSheet } from 'react-native';
import { ListItem } from 'react-native-elements';

import { colors, consts, Icon, normalize } from '../../config';
import { trimNewLines } from '../../helpers';
import { BoldText, RegularText } from '../Text';
import { Touchable } from '../Touchable';

type ItemData = {
  bottomDivider?: boolean;
  onPress?: (navigation: any) => void;
  params: Record<string, unknown>;
  routeName: string;
  status: 'read' | 'unread';
  subtitle?: string;
  title: string;
};

type Props = {
  item: ItemData;
  navigation: StackNavigationProp<Record<string, any>>;
};

export const VolunteerConversationListItem: NamedExoticComponent<Props> & {
  propTypes?: Record<string, Validator<any>>;
} = memo<{
  item: ItemData;
  navigation: StackNavigationProp<Record<string, any>>;
}>(({ item, navigation }) => {
  const { routeName: name, params, subtitle, title, bottomDivider, onPress, status } = item;
  const titleText = trimNewLines(title);
  const navigate = () => navigation && navigation.push(name, params);

  return (
    <ListItem
      bottomDivider={bottomDivider}
      containerStyle={listItemStyles.contentContainerStyle}
      onPress={() => (onPress ? onPress(navigation) : navigate())}
      disabled={!navigation}
      delayPressIn={0}
      Component={Touchable}
      accessibilityLabel={`(${title}) ${consts.a11yLabel.button}`}
    >
      <ListItem.Content>
        {status === 'unread' ? (
          <BoldText small>{subtitle}</BoldText>
        ) : (
          <RegularText small>{subtitle}</RegularText>
        )}
        {status === 'unread' ? (
          <BoldText>{titleText}</BoldText>
        ) : (
          <RegularText>{titleText}</RegularText>
        )}
      </ListItem.Content>

      <Icon.ArrowRight color={colors.darkText} size={normalize(18)} />
    </ListItem>
  );
});

const listItemStyles = StyleSheet.create({
  contentContainerStyle: {
    backgroundColor: colors.transparent,
    paddingVertical: normalize(12)
  }
});

VolunteerConversationListItem.displayName = 'VolunteerConversationListItem';

VolunteerConversationListItem.propTypes = {
  item: PropTypes.object.isRequired,
  navigation: PropTypes.object
};
