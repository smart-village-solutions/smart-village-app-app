import { StackScreenProps } from '@react-navigation/stack';
import React from 'react';
import { StyleSheet } from 'react-native';
import { Divider, normalize } from 'react-native-elements';

import {
  ListComponent,
  SafeAreaViewFlex,
  SectionHeader,
  VolunteerAvatar,
  Wrapper
} from '../../components';
import { colors, texts } from '../../config';
import { parseListItemsFromQuery } from '../../helpers';

// eslint-disable-next-line complexity
export const NoticeboardMemberIndexScreen = ({ navigation, route }: StackScreenProps<any>) => {
  const { data, isCurrentUser, memberName, query } = route.params;

  const listItems = parseListItemsFromQuery(query, data, '', { queryVariables: { isCurrentUser } });

  return (
    <SafeAreaViewFlex>
      <ListComponent
        data={listItems}
        navigation={navigation}
        query={query}
        ListHeaderComponent={
          <>
            {!!memberName && (
              <Wrapper style={styles.center}>
                <VolunteerAvatar item={{ user: { display_name: memberName } }} />
                <SectionHeader containerStyle={styles} small title={memberName} />
              </Wrapper>
            )}

            <SectionHeader containerStyle={styles.sectionHeaderAll} title={texts.noticeboard.all} />

            <Divider style={styles.divider} />
          </>
        }
      />
    </SafeAreaViewFlex>
  );
};

const styles = StyleSheet.create({
  center: {
    alignItems: 'center'
  },
  divider: {
    backgroundColor: colors.placeholder
  },
  sectionHeaderAll: {
    paddingBottom: normalize(16),
    paddingLeft: 0,
    paddingRight: 0
  }
});
