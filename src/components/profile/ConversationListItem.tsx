import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { useQuery } from 'react-apollo';
import { StyleSheet, View } from 'react-native';
import { Badge, ListItem } from 'react-native-elements';

import { colors, normalize } from '../../config';
import { momentFormat } from '../../helpers';
import { QUERY_TYPES, getQuery } from '../../queries';
import { LoadingSpinner } from '../LoadingSpinner';
import { BoldText, RegularText } from '../Text';
import { Touchable } from '../Touchable';
import { VolunteerAvatar } from '../volunteer';

type TConversation = {
  item: {
    bottomDivider: boolean;
    createdAt: string;
    genericItemId: string;
    id: string;
    params: any;
    routeName: string;
    subtitle: string;
    unreadMessagesCount: number;
  };
  navigation: StackNavigationProp<any>;
};

export const ConversationListItem = ({ item, navigation }: TConversation) => {
  const query = QUERY_TYPES.GENERIC_ITEM;

  const { data, loading } = useQuery(getQuery(query), { variables: { id: item.genericItemId } });

  if (loading) {
    return <LoadingSpinner loading />;
  }

  const message = item;
  const genericItem = data[query];

  const {
    bottomDivider = true,
    createdAt,
    subtitle,
    unreadMessagesCount,
    params,
    routeName: name
  } = message;
  const { contacts, title } = genericItem;
  const { firstName, email } = contacts[0];
  const displayName = firstName ? firstName : email;

  return (
    <ListItem
      bottomDivider={bottomDivider}
      containerStyle={styles.container}
      onPress={() => navigation.push(name, { ...params, displayName, title })}
      delayPressIn={0}
      Component={Touchable}
    >
      {/* TODO: As soon as there is a picture for the noticeboard this place will be updated with the
      picture */}
      <VolunteerAvatar item={{ user: { display_name: displayName } }} style={styles.avatar} />
      <View style={styles.textContainer}>
        <View style={styles.rowContainer}>
          <BoldText small>{displayName}</BoldText>
          <RegularText small>{momentFormat(createdAt, 'DD.MM.YYYY')}</RegularText>
        </View>
        <View style={styles.rowContainer}>
          <BoldText numberOfLines={1} style={{ paddingRight: normalize(10) }}>
            {title}
          </BoldText>

          {unreadMessagesCount !== 0 && <Badge badgeStyle={styles.badgeStyle} />}
        </View>

        <RegularText small numberOfLines={1} style={{ paddingRight: normalize(10) }}>
          {subtitle}
        </RegularText>
      </View>
    </ListItem>
  );
};

const styles = StyleSheet.create({
  avatar: {
    alignSelf: 'center'
  },
  badgeStyle: {
    backgroundColor: colors.secondary,
    borderRadius: normalize(8),
    height: normalize(8),
    width: normalize(8)
  },
  container: {
    backgroundColor: colors.transparent,
    paddingHorizontal: 0,
    paddingVertical: normalize(16)
  },
  textContainer: {
    flex: 1
  },
  rowContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between'
  }
});
