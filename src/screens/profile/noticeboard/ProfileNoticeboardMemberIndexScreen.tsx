import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  ListComponent,
  NoticeboardCategoryTabs,
  SafeAreaViewFlex,
  SectionHeader,
  VolunteerAvatar,
  Wrapper
} from '../../../components';
import { parseListItemsFromQuery } from '../../../helpers';

export const ProfileNoticeboardMemberIndexScreen = ({
  navigation,
  route
}: StackScreenProps<any>) => {
  const { data, isCurrentUser, memberName, query } = route.params;

  const [selectedCategory, setSelectedCategory] = useState<number>();

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
    </SafeAreaViewFlex>
  );
};

const styles = StyleSheet.create({
  center: {
    alignItems: 'center'
  }
});
