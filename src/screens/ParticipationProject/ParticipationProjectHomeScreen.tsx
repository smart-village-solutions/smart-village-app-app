import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback, useMemo, useState } from 'react';
import { DeviceEventEmitter, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useQuery } from 'react-query';

import {
  Button,
  ConnectedImagesCarousel,
  EmptyMessage,
  HtmlView,
  LoadingSpinner,
  ReadAloudContent,
  SafeAreaViewFlex,
  SectionHeader,
  TextListItem,
  WrapperVertical
} from '../../components';
import { colors, consts, normalize, texts } from '../../config';
import {
  subtitle as formatSubtitle,
  getParticipationProjectDatePrefix,
  mainImageOfMediaContents,
  matomoTrackingString,
  momentFormatUtcToLocal,
  removeHtml,
  trimNewLines
} from '../../helpers';
import { HOME_REFRESH_EVENT, useMatomoTrackScreenView, useStaticContent } from '../../hooks';
import { getQuery, QUERY_TYPES } from '../../queries';
import { ReactQueryClient } from '../../ReactQueryClient';
import { useReadAloudScrollContentContainerStyle } from '../../ReadAloudAvailabilityProvider';
import { GenericItem, GenericType, ScreenName } from '../../types';

type ParticipationProjectHomeParamList = Record<string, object | undefined> & {
  [ScreenName.ParticipationProjectHome]: undefined;
};

type CategoryOrderEntry = string | number | { id: string | number; title?: string };

type ParticipationProjectHomeConfig = {
  allButtonTitle: string;
  carouselPublicJsonFile: string;
  categoryOrder: CategoryOrderEntry[];
  categoryTitle: string;
  fallbackCategoryTitle: string;
  featuredLimit: number;
  featuredTitle: string;
  hiddenCategoryIds: Array<string | number>;
  homeLimit: number;
  indexLimit: number;
  indexOrder: string;
  introHtmlName: string;
  isCarouselImageFullWidth: boolean;
  showAllButton: boolean;
  showCarousel: boolean;
  showEmptyCategories: boolean;
  showFeatured: boolean;
  showIntro: boolean;
  subtitleNumberOfLines: number;
  title: string;
  titleNumberOfLines: number;
};

type ParticipationProjectStaticConfig = Partial<ParticipationProjectHomeConfig>;

type ParticipationProjectItemsResponse = {
  [QUERY_TYPES.GENERIC_ITEMS]: GenericItem[];
};

type ParticipationProjectPayload = {
  category?: string;
  categoryName?: string;
  itemIndex?: number | string;
  theme?: string;
  type?: string;
};

const DEFAULT_HOME_CONFIG: ParticipationProjectHomeConfig = {
  allButtonTitle: texts.participationProject.showAll,
  carouselPublicJsonFile: 'participationProjectHomeCarousel',
  categoryOrder: [],
  categoryTitle: texts.participationProject.categories,
  fallbackCategoryTitle: texts.participationProject.participationProjects,
  featuredLimit: 3,
  featuredTitle: texts.participationProject.featuredProjects,
  hiddenCategoryIds: [],
  homeLimit: 100,
  indexLimit: 15,
  indexOrder: 'itemIndex',
  introHtmlName: 'participationProjectHomeText',
  isCarouselImageFullWidth: true,
  showAllButton: true,
  showCarousel: true,
  showEmptyCategories: false,
  showFeatured: true,
  showIntro: true,
  subtitleNumberOfLines: 2,
  title: texts.screenTitles.participationProject.home,
  titleNumberOfLines: 2
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

const getProjectItemIndex = (item: GenericItem) => {
  const payload = item.payload as ParticipationProjectPayload | undefined;
  const itemIndex = Number(payload?.itemIndex);

  return Number.isFinite(itemIndex) ? itemIndex : undefined;
};

const sortProjectsByItemIndex = (items: GenericItem[]) =>
  items
    .map((item, index) => ({ index, item, itemIndex: getProjectItemIndex(item) }))
    .sort((first, second) => {
      const firstHasItemIndex = first.itemIndex !== undefined;
      const secondHasItemIndex = second.itemIndex !== undefined;

      if (firstHasItemIndex && secondHasItemIndex) {
        return Number(first.itemIndex) - Number(second.itemIndex);
      }

      if (firstHasItemIndex) return -1;
      if (secondHasItemIndex) return 1;

      return first.index - second.index;
    })
    .map(({ item }) => item);

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

const getPayloadType = (payload: unknown) => {
  if (!payload || typeof payload !== 'object') return;

  return (payload as ParticipationProjectPayload).type;
};

const getContentBlockText = (item: GenericItem) => {
  const body = item.contentBlocks?.[0]?.body;

  if (!body) return;

  return trimNewLines(removeHtml(body) || '')
    .replace(/\s+/g, ' ')
    .trim();
};

const getProjectSubtitle = (item: GenericItem) => getContentBlockText(item);

const getProjectListDate = (item: GenericItem) => {
  const date = item.dates?.[0];
  const dateStart = date?.dateStart;

  if (!dateStart) return;

  return [getParticipationProjectDatePrefix(date), momentFormatUtcToLocal(dateStart)]
    .filter(Boolean)
    .join(' ');
};

const buildProjectListItem = (item: GenericItem, bottomDivider = true) => {
  const type = getPayloadType(item.payload);
  const subtitle = getProjectSubtitle(item);
  const listDate = getProjectListDate(item);

  const overtitle = formatSubtitle(listDate, type);

  const accessibilityLabel = [overtitle, item.title, subtitle]
    .filter(Boolean)
    .map((text) => `(${text})`)
    .join(' ');

  return {
    accessibilityLabel: `${accessibilityLabel} ${consts.a11yLabel.button}`.trim(),
    bottomDivider,
    id: item.id,
    overtitle,
    params: {
      title: texts.participationProject.participationProject,
      query: QUERY_TYPES.GENERIC_ITEM,
      queryVariables: { id: `${item.id}` },
      rootRouteName: consts.ROOT_ROUTE_NAMES.PARTICIPATION_PROJECTS,
      details: item
    },
    picture: {
      url: mainImageOfMediaContents(item.mediaContents)
    },
    routeName: ScreenName.Detail,
    subtitle,
    title: item.title || texts.participationProject.participationProject
  };
};

const buildAllProjectsParams = (homeConfig: ParticipationProjectHomeConfig) => ({
  title: texts.screenTitles.participationProject.index,
  query: QUERY_TYPES.GENERIC_ITEMS,
  queryVariables: {
    genericType: GenericType.ParticipationProject,
    limit: homeConfig.indexLimit,
    participationOrder: homeConfig.indexOrder
  },
  rootRouteName: consts.ROOT_ROUTE_NAMES.PARTICIPATION_PROJECTS
});

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
  const listContentContainerStyle = useReadAloudScrollContentContainerStyle(
    styles.contentContainer
  );

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
      participationOrder: homeConfig.indexOrder
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

  const allProjectsParams = useMemo(() => buildAllProjectsParams(homeConfig), [homeConfig]);

  const categoryItems = useMemo(() => {
    const genericItems = data?.[QUERY_TYPES.GENERIC_ITEMS] || [];
    const categoryGroups = buildCategoryItems({ config: homeConfig, items: genericItems });

    return categoryGroups.map((category) => {
      const countText = texts.participationProject.categoryCount(category.count);
      const categoryQueryVariables = category.categoryId
        ? {
            categoryId: category.categoryId,
            genericType: GenericType.ParticipationProject,
            limit: homeConfig.indexLimit,
            participationOrder: homeConfig.indexOrder,
            subtitleNumberOfLines: homeConfig.subtitleNumberOfLines,
            titleNumberOfLines: homeConfig.titleNumberOfLines
          }
        : {
            genericType: GenericType.ParticipationProject,
            ids: category.itemIds,
            limit: homeConfig.indexLimit,
            participationOrder: homeConfig.indexOrder,
            subtitleNumberOfLines: homeConfig.subtitleNumberOfLines,
            titleNumberOfLines: homeConfig.titleNumberOfLines
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

  const genericItems = useMemo(() => data?.[QUERY_TYPES.GENERIC_ITEMS] || [], [data]);

  const featuredItems = useMemo(() => {
    if (!homeConfig.showFeatured) return [];

    return sortProjectsByItemIndex(genericItems)
      .slice(0, homeConfig.featuredLimit)
      .map((item, index, items) => buildProjectListItem(item, index !== items.length - 1));
  }, [genericItems, homeConfig.featuredLimit, homeConfig.showFeatured]);

  const refreshHome = useCallback(async () => {
    setRefreshing(true);

    await Promise.all([refetchHomeConfig(), refetchIntro(), refetchProjects()]);
    DeviceEventEmitter.emit(HOME_REFRESH_EVENT);

    setRefreshing(false);
  }, [refetchHomeConfig, refetchIntro, refetchProjects]);

  const renderCategoryItem = useCallback(
    ({ item }) => <TextListItem item={item} navigation={navigation} />,
    [navigation]
  );

  const openAllProjects = useCallback(() => {
    navigation.navigate(ScreenName.Index, allProjectsParams);
  }, [allProjectsParams, navigation]);

  useMatomoTrackScreenView(
    matomoTrackingString([consts.MATOMO_TRACKING.SCREEN_VIEW.PARTICIPATION_PROJECTS])
  );

  if (loadingHomeConfig || loadingIntro || loadingProjects) {
    return <LoadingSpinner loading />;
  }

  return (
    <SafeAreaViewFlex>
      <FlatList
        data={categoryItems}
        ListEmptyComponent={<EmptyMessage title={texts.participationProject.empty} showIcon />}
        ListHeaderComponent={
          <>
            {homeConfig.showCarousel && (
              <ConnectedImagesCarousel
                isImageFullWidth={homeConfig.isCarouselImageFullWidth}
                navigation={navigation}
                publicJsonFile={homeConfig.carouselPublicJsonFile}
              />
            )}

            {!!introHtml && (
              <WrapperVertical>
                <View style={styles.readAloudContainer}>
                  <ReadAloudContent
                    content={introHtml}
                    contentId="participation-project-home-content"
                  />
                </View>
                <WrapperVertical noPaddingBottom>
                  <HtmlView html={introHtml} />
                </WrapperVertical>
              </WrapperVertical>
            )}

            <SectionHeader title={homeConfig.categoryTitle} containerStyle={styles.sectionHeader} />
          </>
        }
        ListFooterComponent={
          <>
            {!!featuredItems.length && (
              <WrapperVertical>
                <SectionHeader
                  title={homeConfig.featuredTitle}
                  containerStyle={styles.sectionHeader}
                />
                {featuredItems.map((item) => (
                  <TextListItem
                    item={item}
                    key={item.id}
                    leftImage
                    navigation={navigation}
                    subtitleNumberOfLines={homeConfig.subtitleNumberOfLines}
                    titleNumberOfLines={homeConfig.titleNumberOfLines}
                    withCard
                  />
                ))}
              </WrapperVertical>
            )}

            {homeConfig.showAllButton && (
              <Button title={homeConfig.allButtonTitle} onPress={openAllProjects} />
            )}
          </>
        }
        contentContainerStyle={listContentContainerStyle}
        keyExtractor={(item) => item.id}
        renderItem={renderCategoryItem}
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
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: normalize(16)
  },
  readAloudContainer: {
    marginHorizontal: normalize(-16)
  },
  sectionHeader: {
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: normalize(8)
  }
});
