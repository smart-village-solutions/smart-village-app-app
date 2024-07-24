import React from 'react';
import { StyleSheet, TouchableHighlight, View } from 'react-native';
import { Divider, Tab } from 'react-native-elements';

import { colors, normalize } from '../../../config';

export const ProfileNoticeboardCategoryTabs = ({
  categoryIdsTabs,
  categoryNames,
  selectedCategory,
  setSelectedCategory
}: {
  categoryIdsTabs: number[];
  categoryNames: { [key: number]: string };
  selectedCategory?: number;
  setSelectedCategory: (category: number) => void;
}) => {
  return (
    <View style={styles.tabsContainer}>
      <Tab
        indicatorStyle={styles.tabsIndicator}
        onChange={(index) => setSelectedCategory(categoryIdsTabs[index])}
        value={categoryIdsTabs.indexOf(selectedCategory)}
      >
        {categoryIdsTabs?.map((categoryId: number) => (
          <Tab.Item
            key={categoryId}
            title={categoryNames?.[categoryId]}
            style={styles.tabsTab}
            titleStyle={[styles.tabsTitle, categoryId === selectedCategory && styles.boldText]}
            TouchableComponent={TouchableHighlight}
            underlayColor={colors.surface}
          />
        ))}
      </Tab>
      <Divider style={styles.divider} />
    </View>
  );
};

const styles = StyleSheet.create({
  boldText: {
    fontFamily: 'condbold'
  },
  divider: {
    backgroundColor: colors.placeholder
  },
  tabsContainer: {
    backgroundColor: colors.surface
  },
  tabsIndicator: {
    backgroundColor: colors.secondary
  },
  tabsTab: {
    backgroundColor: colors.surface,
    borderBottomWidth: 0
  },
  tabsTitle: {
    color: colors.primary,
    fontFamily: 'condbold-regular',
    fontSize: normalize(18),
    lineHeight: normalize(23),
    textTransform: 'none'
  }
});
