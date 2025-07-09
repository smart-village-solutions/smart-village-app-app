import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback, useState } from 'react';
import { useMutation } from 'react-apollo';
import { Alert, StyleSheet, View } from 'react-native';

import {
  FlagMemberFooter,
  ListComponent,
  SafeAreaViewFlex,
  SectionHeader,
  VolunteerAvatar,
  Wrapper
} from '../../components';
import { texts } from '../../config';
import { parseListItemsFromQuery } from '../../helpers';
import { createQuery, QUERY_TYPES } from '../../queries';

// eslint-disable-next-line complexity
export const NoticeboardMemberIndexScreen = ({ navigation, route }: StackScreenProps<any>) => {
  const [selectedCategory, setSelectedCategory] = useState<number>();
  const [createAppUserContent] = useMutation(createQuery(QUERY_TYPES.APP_USER_CONTENT));

  const { data, isCurrentUser, memberId, memberEmail, memberName, query } = route.params;
  const listItems = parseListItemsFromQuery(query, data, '', { queryVariables: { isCurrentUser } });

  // create new object of list items filtered by selected category
  const filteredListItems = listItems?.filter((item: { categories: { id: string }[] }) =>
    item.categories.some((category: { id: string }) => category.id == selectedCategory)
  );

  // get all category names from list items
  const categoryNames = listItems?.reduce((acc, item) => {
    if (item.categories.length) {
      acc[item.categories[0].id] = item.categories[0].name;
    }

    return acc;
  }, {});

  // sort the category names object by value alphabetically, because we do not have passed
  // categories like for the `NoticeboardIndexScreen`
  const sortedCategoryNames = Object.entries(categoryNames).sort((a, b) =>
    a[1].localeCompare(b[1])
  );

  // filter out the category ids
  const categoryIdsTabs = sortedCategoryNames?.map((category) => parseInt(category[0]));

  useFocusEffect(
    useCallback(() => {
      // if there are no filtered list items for the selected category, select the other category
      if (
        !filteredListItems?.filter((item: any) => !item.component)?.length &&
        !!categoryIdsTabs?.length
      ) {
        setSelectedCategory(
          categoryIdsTabs.find((categoryId: number) => categoryId != selectedCategory)
        );
      }
    }, [filteredListItems, selectedCategory, categoryIdsTabs])
  );

  // add the section header component to the beginning of the list items, that will be at index 1,
  // that we want to stick to the top of the screen when scrolling
  !!categoryIdsTabs?.length &&
    filteredListItems?.unshift({
      component: (
        <NoticeboardCategoryTabs
          categoryIdsTabs={categoryIdsTabs}
          categoryNames={categoryNames}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
      )
    });

  const onSubmit = async () => {
    const formData = {
      dataType: 'json',
      dataSource: 'form',
      content: JSON.stringify({
        name: memberName.trim() || '',
        email: memberEmail || '',
        message: texts.profile.flagProfileSubject,
        action: 'flag_member',
        memberId
      })
    };

    try {
      await createAppUserContent({ variables: formData });
      Alert.alert(
        texts.profile.flagProfileAlertDoneTitle,
        texts.profile.flagProfileAlertDoneMessage
      );
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <SafeAreaViewFlex>
      <ListComponent
        data={filteredListItems}
        ListHeaderComponent={
          memberName ? (
            <Wrapper style={styles.center}>
              <VolunteerAvatar item={{ user: { display_name: memberName } }} />
              <SectionHeader containerStyle={styles} small title={memberName} />
            </Wrapper>
          ) : (
            <View />
          )
        }
        navigation={navigation}
        query={query}
        stickyHeaderIndices={[1]}
      />
      {!isCurrentUser && (
        <FlagMemberFooter
          onPress={() =>
            Alert.alert(texts.profile.hint, texts.profile.flagProfileAlertMessage, [
              { text: texts.profile.abort, style: 'cancel' },
              {
                text: texts.profile.flag,
                onPress: onSubmit,
                style: 'destructive'
              }
            ])
          }
        />
      )}
    </SafeAreaViewFlex>
  );
};

const styles = StyleSheet.create({
  center: {
    alignItems: 'center'
  }
});
