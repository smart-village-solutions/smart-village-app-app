import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation } from 'react-apollo';
import { Alert, StyleSheet, View } from 'react-native';

import {
  FlagMemberFooter,
  ListComponent,
  NoticeboardCategoryTabs,
  SafeAreaViewFlex,
  SectionHeader,
  VolunteerAvatar,
  Wrapper
} from '../../components';
import { texts } from '../../config';
import { parseListItemsFromQuery } from '../../helpers';
import { createQuery, QUERY_TYPES } from '../../queries';

/* eslint-disable complexity */
export const NoticeboardMemberIndexScreen = ({ navigation, route }: StackScreenProps<any>) => {
  const subQuery = route.params?.subQuery ?? {};

  const [selectedCategory, setSelectedCategory] = useState<number>();
  const [createAppUserContent] = useMutation(createQuery(QUERY_TYPES.APP_USER_CONTENT));

  const { data, isCurrentUser, memberId, memberEmail, memberName, query } = route.params;
  const listItems = parseListItemsFromQuery(query, data, '', {
    queryVariables: { isCurrentUser },
    subQuery
  });

  // create new object of list items filtered by selected category
  const filteredListItems = useMemo(() => {
    return listItems?.filter((item: { categories: { id: string }[] }) =>
      item.categories.some((category: { id: string }) => category.id == selectedCategory)
    );
  }, [listItems, selectedCategory]);

  // get all category names from list items
  const categoryNames = useMemo(() => {
    return listItems?.reduce((acc, item) => {
      if (item.categories.length) {
        acc[item.categories[0].id] = item.categories[0].name;
      }
      return acc;
    }, {});
  }, [listItems]);

  // sort the category names object by value alphabetically, because we do not have passed
  // categories like for the `NoticeboardIndexScreen`
  const sortedCategoryNames = Object.entries(categoryNames).sort((a, b) =>
    a[1].localeCompare(b[1])
  );

  // filter out the category ids
  const categoryIdsTabs = sortedCategoryNames?.map((category) => parseInt(category[0]));

  // initialize selectedCategory with the first category that has items, or just the first category
  useEffect(() => {
    if (!categoryIdsTabs?.length || selectedCategory) return;

    // try to find a category with items
    const categoryWithItems = categoryIdsTabs.find((categoryId: number) => {
      const itemsForCategory = listItems?.filter((item: { categories: { id: string }[] }) =>
        item.categories.some((category: { id: string }) => category.id == categoryId)
      );
      return itemsForCategory?.filter((item: any) => !item.component)?.length > 0;
    });

    // select category with items, or fallback to first category
    setSelectedCategory(categoryWithItems ?? categoryIdsTabs[0]);
  }, [categoryIdsTabs, selectedCategory, listItems]);

  useFocusEffect(
    useCallback(() => {
      // check if the selected category still has items
      // if not, switch to the other category
      if (
        selectedCategory &&
        categoryIdsTabs?.length &&
        !filteredListItems?.filter((item: any) => !item.component)?.length
      ) {
        const otherCategory = categoryIdsTabs.find(
          (categoryId: number) => categoryId != selectedCategory
        );
        if (otherCategory) {
          setSelectedCategory(otherCategory);
        }
      }
    }, [selectedCategory, categoryIdsTabs, filteredListItems])
  );

  // add the section header component to the beginning of the list items, that will be at index 1,
  // that we want to stick to the top of the screen when scrolling
  const listData = useMemo(() => {
    if (!categoryIdsTabs?.length) return filteredListItems;

    return [
      {
        component: (
          <NoticeboardCategoryTabs
            categoryIdsTabs={categoryIdsTabs}
            categoryNames={categoryNames}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
        )
      },
      ...filteredListItems
    ];
  }, [categoryIdsTabs, filteredListItems, categoryNames, selectedCategory]);

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
        data={listData}
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
/* eslint-enable complexity */

const styles = StyleSheet.create({
  center: {
    alignItems: 'center'
  }
});
