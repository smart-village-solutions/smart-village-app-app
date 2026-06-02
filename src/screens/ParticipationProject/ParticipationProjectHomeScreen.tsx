import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback, useMemo, useState } from 'react';
import { RefreshControl, StyleSheet } from 'react-native';
import { useQuery } from 'react-query';

import {
  EmptyMessage,
  HtmlView,
  ListComponent,
  LoadingSpinner,
  ReadAloudContent,
  SafeAreaViewFlex,
  SectionHeader,
  WrapperVertical
} from '../../components';
import { colors, consts, texts } from '../../config';
import { matomoTrackingString } from '../../helpers';
import { useMatomoTrackScreenView, useStaticContent } from '../../hooks';
import { getQuery, QUERY_TYPES } from '../../queries';
import { ReactQueryClient } from '../../ReactQueryClient';
import { GenericItem, GenericType, ScreenName } from '../../types';

type ParticipationProjectHomeParamList = Record<string, object | undefined> & {
  [ScreenName.ParticipationProjectHome]: undefined;
};

type CategoryOrderEntry = string | number | { id: string | number; title?: string };

type ParticipationProjectHomeConfig = {
  categoryOrder: CategoryOrderEntry[];
  categoryTitle: string;
  fallbackCategoryTitle: string;
  hiddenCategoryIds: Array<string | number>;
  homeLimit: number;
  indexLimit: number;
  indexOrder: string;
  introHtmlName: string;
  showEmptyCategories: boolean;
  showIntro: boolean;
  title: string;
};

type ParticipationProjectStaticConfig = Partial<ParticipationProjectHomeConfig>;

type ParticipationProjectItemsResponse = {
  [QUERY_TYPES.GENERIC_ITEMS]: GenericItem[];
};

type ParticipationProjectPayload = {
  category?: string;
  categoryName?: string;
  theme?: string;
};

const DEFAULT_HOME_CONFIG: ParticipationProjectHomeConfig = {
  categoryOrder: [],
  categoryTitle: texts.participationProject.categories,
  fallbackCategoryTitle: texts.participationProject.participationProjects,
  hiddenCategoryIds: [],
  homeLimit: 100,
  indexLimit: 15,
  indexOrder: 'publicationDate_DESC',
  introHtmlName: 'participationProjectHomeText',
  showEmptyCategories: false,
  showIntro: true,
  title: texts.screenTitles.participationProject.home
};

type CategoryGroup = {
  categoryId?: string;
  count: number;
  id: string;
  itemIds: string[];
  title: string;
};

const FALLBACK_CATEGORY_ID = 'uncategorized';

const getCategoryOrderEntry = (
  entry: string | number | { id: string | number; title?: string }
) => {
  if (typeof entry === 'object') {
    return { id: `${entry.id}`, title: entry.title };
  }

  return { id: `${entry}` };
};

const sortByTitle = (items: CategoryGroup[]) =>
  [...items].sort((first, second) => first.title.localeCompare(second.title));

const getPayloadCategoryName = (payload: unknown) => {
  if (!payload || typeof payload !== 'object') return;

  const participationProjectPayload = payload as ParticipationProjectPayload;

  return (
    participationProjectPayload.theme ||
    participationProjectPayload.categoryName ||
    participationProjectPayload.category
  );
};

const getItemCategories = (item: GenericItem, fallbackCategoryTitle: string) => {
  if (item.categories?.length) return item.categories;

  const payloadCategoryName = getPayloadCategoryName(item.payload);

  return [{ name: payloadCategoryName || fallbackCategoryTitle }];
};

const buildCategoryItems = ({
  config,
  items
}: {
  config: ParticipationProjectHomeConfig;
  items: GenericItem[];
}) => {
  const groups = new Map<string, CategoryGroup>();
  const hiddenCategoryIds = new Set(config.hiddenCategoryIds.map((id) => `${id}`));

  items.forEach((item) => {
    const categories = getItemCategories(item, config.fallbackCategoryTitle);

    categories.forEach((category) => {
      const categoryId = category.id ? `${category.id}` : undefined;
      const id = categoryId || category.name || FALLBACK_CATEGORY_ID;

      if (hiddenCategoryIds.has(id)) return;

      const currentGroup = groups.get(id) || {
        categoryId,
        count: 0,
        id,
        itemIds: [],
        title: category.name || config.fallbackCategoryTitle
      };

      currentGroup.count += 1;
      currentGroup.itemIds.push(item.id);
      groups.set(id, currentGroup);
    });
  });

  const orderedGroups: CategoryGroup[] = [];

  config.categoryOrder.forEach((entry) => {
    const { id, title } = getCategoryOrderEntry(entry);
    const group = groups.get(id);

    if (group) {
      orderedGroups.push({ ...group, title: title || group.title });
      groups.delete(id);
    } else if (config.showEmptyCategories && !hiddenCategoryIds.has(id)) {
      orderedGroups.push({ categoryId: id, count: 0, id, itemIds: [], title: title || id });
    }
  });

  return [...orderedGroups, ...sortByTitle(Array.from(groups.values()))];
};

export const ParticipationProjectHomeScreen = ({
  navigation
}: StackScreenProps<ParticipationProjectHomeParamList, ScreenName.ParticipationProjectHome>) => {
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: homeConfigData,
    loading: loadingHomeConfig,
    refetch: refetchHomeConfig
  } = useStaticContent<ParticipationProjectStaticConfig>({
    name: 'participationProjectHome',
    type: 'json'
  });

  const homeConfig = useMemo(
    () => ({ ...DEFAULT_HOME_CONFIG, ...(homeConfigData || {}) }),
    [homeConfigData]
  );
  const introHtmlName = homeConfig.showIntro ? homeConfig.introHtmlName : undefined;

  const {
    data: introHtml,
    loading: loadingIntro,
    refetch: refetchIntro
  } = useStaticContent<string>({
    name: introHtmlName || '',
    type: 'html',
    skip: !introHtmlName
  });

  const queryVariables = useMemo(
    () => ({
      genericType: GenericType.ParticipationProject,
      limit: homeConfig.homeLimit,
      order: homeConfig.indexOrder
    }),
    [homeConfig.homeLimit, homeConfig.indexOrder]
  );

  const {
    data,
    isLoading: loadingProjects,
    refetch: refetchProjects
  } = useQuery<ParticipationProjectItemsResponse>(
    [QUERY_TYPES.GENERIC_ITEMS, queryVariables],
    async () => {
      const client = await ReactQueryClient();

      return await client.request<ParticipationProjectItemsResponse>(
        getQuery(QUERY_TYPES.GENERIC_ITEMS),
        queryVariables
      );
    }
  );

  const categoryItems = useMemo(() => {
    const genericItems = data?.[QUERY_TYPES.GENERIC_ITEMS] || [];
    const categoryGroups = buildCategoryItems({ config: homeConfig, items: genericItems });

    return categoryGroups.map((category) => {
      const countText = texts.participationProject.categoryCount(category.count);
      const categoryQueryVariables = category.categoryId
        ? {
            genericType: GenericType.ParticipationProject,
            categoryId: category.categoryId,
            limit: homeConfig.indexLimit,
            order: homeConfig.indexOrder
          }
        : {
            genericType: GenericType.ParticipationProject,
            ids: category.itemIds,
            limit: homeConfig.indexLimit,
            order: homeConfig.indexOrder
          };

      return {
        accessibilityLabel: `(${category.title}) ${countText} ${consts.a11yLabel.button}`,
        count: category.count,
        id: category.id,
        params: {
          title: category.title,
          query: QUERY_TYPES.GENERIC_ITEMS,
          queryVariables: categoryQueryVariables,
          rootRouteName: consts.ROOT_ROUTE_NAMES.PARTICIPATION_PROJECTS
        },
        routeName: ScreenName.Index,
        title: category.title
      };
    });
  }, [data, homeConfig]);

  const refreshHome = useCallback(async () => {
    setRefreshing(true);

    await Promise.all([refetchHomeConfig(), refetchIntro(), refetchProjects()]);

    setRefreshing(false);
  }, [refetchHomeConfig, refetchIntro, refetchProjects]);

  useMatomoTrackScreenView(
    matomoTrackingString([consts.MATOMO_TRACKING.SCREEN_VIEW.PARTICIPATION_PROJECTS])
  );

  if (loadingHomeConfig || loadingIntro || loadingProjects) {
    return <LoadingSpinner loading />;
  }

  return (
    <SafeAreaViewFlex>
      <ListComponent
        data={categoryItems}
        ListEmptyComponent={<EmptyMessage title={texts.participationProject.empty} showIcon />}
        ListHeaderComponent={
          <>
            {!!introHtml && (
              <WrapperVertical>
                <ReadAloudContent
                  content={introHtml}
                  contentId="participation-project-home-content"
                />
                <HtmlView html={introHtml} />
              </WrapperVertical>
            )}
            <SectionHeader title={homeConfig.categoryTitle} containerStyle={styles.sectionHeader} />
          </>
        }
        listType={consts.LIST_TYPES.TEXT_LIST}
        navigation={navigation}
        query={QUERY_TYPES.GENERIC_ITEMS}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshHome}
            colors={[colors.refreshControl]}
            tintColor={colors.refreshControl}
          />
        }
      />
    </SafeAreaViewFlex>
  );
};

const styles = StyleSheet.create({
  sectionHeader: {
    paddingLeft: 0,
    paddingRight: 0
  }
});
