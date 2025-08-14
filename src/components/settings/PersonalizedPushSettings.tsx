import React, { useContext, useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { useQuery } from 'react-query';

import { ReactQueryClient } from '../../ReactQueryClient';
import { SettingsContext } from '../../SettingsProvider';
import { normalize, texts } from '../../config';
import {
  addExcludeCategoriesPushTokenOnServer,
  getExcludedCategoriesPushTokenFromServer,
  getInAppPermission,
  getPushTokenFromStorage
} from '../../pushNotifications';
import { getQuery, QUERY_TYPES } from '../../queries';
import { onActivatePushNotifications, onDeactivatePushNotifications } from '../../screens';
import { LoadingSpinner } from '../LoadingSpinner';
import { SafeAreaViewFlex } from '../SafeAreaViewFlex';
import { SettingsToggle } from '../SettingsToggle';

type Category = {
  iconName?: string | null;
  id: string;
  name: string;
  tagList: string[];
};

const keyExtractor = (item, index) => `index${index}-id${item.id}`;

export const PersonalizedPushSettings = () => {
  const { globalSettings } = useContext(SettingsContext);
  const { settings = {} } = globalSettings;
  const { personalizedPush = {}, settingsScreenListItemTitles = {} } = settings;
  const queryVariables = personalizedPush.variables || {
    tagList: ['news_item']
  };

  const [permission, setPermission] = useState<boolean>(false);
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<{ id: string; tag: string[] }[]>(
    []
  );
  const [excludeCategoryIds, setExcludeCategoryIds] = useState<{ id: string; tag: string[] }[]>([]);

  const { data, isLoading: loading } = useQuery(
    [QUERY_TYPES.CATEGORIES_FILTER, queryVariables],
    async () => {
      const client = await ReactQueryClient();

      return await client.request(getQuery(QUERY_TYPES.CATEGORIES_FILTER), queryVariables);
    },
    {
      enabled: !!personalizedPush?.categories
    }
  );

  useEffect(() => {
    (async () => {
      const inAppPermission = await getInAppPermission();
      setPermission(!!inAppPermission);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const storedToken = await getPushTokenFromStorage();
      setPushToken(storedToken);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (pushToken) {
        const categories = await getExcludedCategoriesPushTokenFromServer(pushToken);
        setExcludeCategoryIds(categories);
      }
    })();
  }, [pushToken]);

  useEffect(() => {
    if (pushToken) {
      const tagList = queryVariables?.tagList;

      const excludeCategoryIds: Record<string, Record<string, unknown>> = {};

      tagList.forEach((tag) => {
        excludeCategoryIds[tag] = {};
      });

      selectedCategoryIds?.forEach(({ tag, id }) => {
        if (!excludeCategoryIds[tag]) {
          excludeCategoryIds[tag] = {};
        }
        excludeCategoryIds[tag][id] = {};
      });

      addExcludeCategoriesPushTokenOnServer(pushToken, excludeCategoryIds);
    }
  }, [selectedCategoryIds, queryVariables?.tagList]);

  const onActivate = (revert: () => void) => {
    setPermission(true);
    onActivatePushNotifications(() => {
      setPermission(false);
      revert?.();
    });
  };

  const onDeactivate = (revert: () => void) => {
    setPermission(false);
    onDeactivatePushNotifications(() => {
      setPermission(true);
      revert?.();
    });
  };

  const listItems = useMemo(() => {
    const categories: Category[] = data?.categories ?? [];

    const initialListItem = {
      onActivate,
      onDeactivate,
      title:
        settingsScreenListItemTitles.pushNotifications || texts.settingsTitles.pushNotifications,
      topDivider: false,
      value: permission
    };

    if (!categories?.length) return [initialListItem];

    const parsedListItems = categories.map((category) => {
      const tagListArray = Array.isArray(category.tagList)
        ? category.tagList
        : typeof category.tagList === 'string'
        ? category.tagList.split(',').map((tag) => tag.trim())
        : [];

      const isExcluded = tagListArray.some(
        (tag) => excludeCategoryIds?.[tag]?.[category.id] !== undefined
      );

      return {
        categoryId: category.id,
        iconName: category.iconName,
        id: category.id,
        isDisabled: !permission,
        onActivate: () =>
          setSelectedCategoryIds((prev) => prev.filter((item) => item.id !== category.id)),
        onDeactivate: () =>
          setSelectedCategoryIds((prev) => [...prev, { id: category.id, tag: category.tagList }]),
        title: category.name,
        topDivider: true,
        value: !isExcluded
      };
    });

    return [initialListItem, ...parsedListItems];
  }, [data, permission, excludeCategoryIds]);

  if (loading) {
    return <LoadingSpinner loading />;
  }

  return (
    <SafeAreaViewFlex>
      <FlatList
        data={listItems}
        keyExtractor={keyExtractor}
        renderItem={({ item }) => <SettingsToggle item={item} />}
        style={styles.container}
      />
    </SafeAreaViewFlex>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: normalize(16)
  }
});
