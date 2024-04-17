import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback, useContext, useState } from 'react';
import { useQuery } from 'react-apollo';
import {
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  TouchableHighlight,
  View
} from 'react-native';
import { Divider, Tab } from 'react-native-elements';

import {
  Button,
  EmptyMessage,
  ListComponent,
  LoadingContainer,
  navigateWithSubQuery,
  SafeAreaViewFlex,
  Wrapper
} from '../../components';
import { colors, Icon, normalize, texts } from '../../config';
import { graphqlFetchPolicy, parseListItemsFromQuery } from '../../helpers';
import { useStaticContent } from '../../hooks';
import { NetworkContext } from '../../NetworkProvider';
import { getQuery } from '../../queries';
import { ListHeaderComponent } from '../NestedInfoScreen';

/* eslint-disable complexity */
export const NoticeboardIndexScreen = ({ navigation, route }: StackScreenProps<any>) => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp });
  const [refreshing, setRefreshing] = useState(false);

  const consentForDataProcessingText = route.params?.consentForDataProcessingText ?? '';
  const content = route.params?.content ?? '';
  const query = route.params?.query ?? '';
  const queryVariables = route.params?.queryVariables ?? {};
  const subQuery = route.params?.subQuery ?? '';
  const rootRouteName = route.params?.rootRouteName ?? '';
  const categoryIds = queryVariables?.categoryIds ?? [];
  const currentMember = queryVariables?.currentMember ?? false;

  const [selectedCategory, setSelectedCategory] = useState(categoryIds[0]);

  const { data, loading, refetch } = useQuery(getQuery(query), {
    fetchPolicy,
    variables: queryVariables
  });

  const listItems = parseListItemsFromQuery(query, data, '', {
    consentForDataProcessingText,
    queryVariables
  });

  // get all category names from list items
  const categoryNames = listItems?.reduce((acc, item) => {
    if (item.categories.length) {
      acc[item.categories[0].id] = item.categories[0].name;
    }

    return acc;
  }, {});

  const {
    data: dataHtml,
    loading: loadingHtml,
    refetch: refetchHtml
  } = useStaticContent<string>({
    name: content,
    type: 'html',
    skip: !content
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (isConnected) {
      await refetch?.();
      await refetchHtml?.();
    }
    setRefreshing(false);
  }, [isConnected, refetch]);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [])
  );

  if (loading && !listItems?.length)
    return (
      <LoadingContainer>
        <ActivityIndicator color={colors.refreshControl} />
      </LoadingContainer>
    );

  if (!listItems?.length) {
    return <EmptyMessage title={texts.noticeboard.emptyTitle} />;
  }

  // create new object of list items filtered by selected category
  const filteredListItems = listItems.filter((item: { categories: { id: string }[] }) =>
    item.categories.some((category: { id: string }) => category.id == selectedCategory)
  );

  // add the section header component to the beginning of the list items, that will be at index 1,
  // that we want to stick to the top of the screen when scrolling
  filteredListItems?.unshift({
    component: (
      <View style={styles.tabsContainer}>
        <Tab
          indicatorStyle={styles.tabsIndicator}
          onChange={(index) => setSelectedCategory(categoryIds[index])}
          value={categoryIds.indexOf(selectedCategory)}
        >
          {categoryIds.map((categoryId: number) => (
            <Tab.Item
              key={categoryId}
              title={categoryNames[categoryId]}
              style={styles.tabsTab}
              titleStyle={styles.tabsTitle}
              TouchableComponent={TouchableHighlight}
              underlayColor={colors.surface}
            />
          ))}
        </Tab>
        <Divider style={styles.divider} />
      </View>
    )
  });

  return (
    <SafeAreaViewFlex>
      <ListComponent
        data={filteredListItems}
        ListHeaderComponent={
          !currentMember ? (
            <ListHeaderComponent html={dataHtml} loading={loadingHtml} navigation={navigation} />
          ) : (
            <View />
          )
        }
        navigation={navigation}
        query={query}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.refreshControl]}
            tintColor={colors.refreshControl}
          />
        }
        stickyHeaderIndices={[1]}
      />
      {!!subQuery && !!subQuery.routeName && !!subQuery.params && (
        <>
          <Divider style={styles.divider} />
          <Wrapper style={styles.noPaddingBotton}>
            <Button
              icon={<Icon.PencilPlus size={normalize(24)} />}
              iconPosition="left"
              title={subQuery.buttonTitle}
              onPress={() =>
                navigateWithSubQuery({
                  navigation,
                  subQuery,
                  rootRouteName,
                  title: subQuery?.buttonTitle
                })
              }
            />
          </Wrapper>
        </>
      )}
    </SafeAreaViewFlex>
  );
};
/* eslint-enable complexity */

const styles = StyleSheet.create({
  divider: {
    backgroundColor: colors.placeholder
  },
  noPaddingBotton: {
    paddingBottom: 0
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
    fontFamily: 'regular',
    fontSize: normalize(12),
    lineHeight: normalize(16),
    textTransform: 'none'
  }
});
