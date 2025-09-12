import _cloneDeep from 'lodash/cloneDeep';
import _isEmpty from 'lodash/isEmpty';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { FlatList } from 'react-native';
import { useQuery } from 'react-query';

import { ReactQueryClient } from '../../ReactQueryClient';
import { SettingsContext } from '../../SettingsProvider';
import { texts } from '../../config';
import {
  addExcludeNotificationConfigurationOnServer,
  getExcludeNotificationConfigurationFromServer,
  getInAppPermission,
  getPushTokenFromStorage
} from '../../pushNotifications';
import { getQuery, QUERY_TYPES } from '../../queries';
import { onActivatePushNotifications, onDeactivatePushNotifications } from '../../screens';
import { LoadingSpinner } from '../LoadingSpinner';
import { SettingsToggle } from '../SettingsToggle';
import { RegularText } from '../Text';
import { Wrapper, WrapperHorizontal } from '../Wrapper';
import { addToStore, readFromStore, removeFromStore, sleep } from '../../helpers';

const PERSONALIZED_PUSH_SETTINGS = 'PERSONALIZED_PUSH_SETTINGS';

type Category = {
  iconName?: string | null;
  id: string;
  name: string;
  tagList: string[];
};

type ExcludeMap = Record<string, Record<string, unknown>>;

const keyExtractor = (item, index) => `index${index}-id${item.id}`;

const tagListArray = (tag) => {
  return Array.isArray(tag)
    ? tag
    : typeof tag === 'string'
    ? tag.split(',').map((x) => x.trim())
    : [];
};

export const PersonalizedPushSettings = () => {
  const { globalSettings } = useContext(SettingsContext);
  const { settings = {} } = globalSettings;
  const { personalizedPush = {}, settingsScreenListItemTitles = {} } = settings;
  const queryVariables = personalizedPush.categories?.queryVariables || {
    tagList: ['news_item']
  };

  const [permission, setPermission] = useState<boolean>(false);
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<{ id: string; tags: string[] }[]>(
    []
  );
  const [excludeCategoryIds, setExcludeCategoryIds] = useState<ExcludeMap>({});

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

  const addIdsOnServer = useCallback(
    (categories: { id: string; tags: string[] }[], token?: string | null) => {
      if (!token) return;

      const tagList = queryVariables?.tagList ?? [];
      const categoryIds: ExcludeMap = _cloneDeep(excludeCategoryIds || {});
      const selectedByTag = new Map<string, Set<string>>();

      categories.forEach(({ id, tags }) => {
        tagListArray(tags)?.forEach((t) => {
          if (!selectedByTag.has(t)) selectedByTag.set(t, new Set());
          const set = selectedByTag.get(t);
          if (set) set.add(String(id));
        });
      });

      tagList.forEach((t: string) => {
        const ids = selectedByTag.get(t) ?? new Set<string>();
        const obj: Record<string, {}> = {};

        ids.forEach((id) => {
          obj[id] = {};
        });

        categoryIds[t] = obj;
      });

      addExcludeNotificationConfigurationOnServer(token, categoryIds);
    },
    [queryVariables?.tagList, excludeCategoryIds]
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
      if (!pushToken) return;

      const categories = await getExcludeNotificationConfigurationFromServer(pushToken);
      setExcludeCategoryIds(categories);
    })();
  }, [pushToken]);

  useEffect(() => {
    if (!Object.keys(excludeCategoryIds).length) return;

    const newCategories = Object.entries(excludeCategoryIds).flatMap(([tag, items]) =>
      Object.keys(items).map((id) => ({ id, tags: [tag] }))
    );

    setSelectedCategoryIds((prev) => [...prev, ...newCategories]);
  }, [excludeCategoryIds]);

  useEffect(() => {
    addIdsOnServer(selectedCategoryIds, pushToken);
  }, [addIdsOnServer, selectedCategoryIds, pushToken]);

  useEffect(() => {
    if (!!pushToken || permission) return;

    (async () => {
      const storedCategories = await readFromStore(PERSONALIZED_PUSH_SETTINGS);

      if (storedCategories?.length) {
        setExcludeCategoryIds(
          storedCategories.reduce((acc, { id, tags }) => {
            tags.forEach((tag) => {
              if (!acc[tag]) acc[tag] = {};
              acc[tag][id] = {};
            });
            return acc;
          }, {})
        );
      }
    })();
  }, [pushToken, permission]);

  const onActivate = async (revert: () => void) => {
    setPermission(true);
    onActivatePushNotifications(() => {
      setPermission(false);
      revert?.();
    });

    const storedCategories = await readFromStore(PERSONALIZED_PUSH_SETTINGS);
    let token;
    let retryCount = 0;

    // Try to get the push token and sync the categories to the server, but give up after 3 seconds total (including all retries and delays)
    while (retryCount < 10 && !token) {
      try {
        token = await getPushTokenFromStorage();
      } catch (e) {
        console.warn(e);
      } finally {
        if (token) {
          addIdsOnServer(storedCategories, token);

          // cleanup the local storage after successful sync
          await removeFromStore(PERSONALIZED_PUSH_SETTINGS);

          break;
        }

        await sleep(300);
        retryCount++;
      }
    }
  };

  const onDeactivate = async (revert: () => void) => {
    addToStore(PERSONALIZED_PUSH_SETTINGS, selectedCategoryIds);
    setPermission(false);
    onDeactivatePushNotifications(() => {
      setPermission(true);
      revert?.();
    });
  };

  const listItems = useMemo(() => {
    const parsedListItems = data?.categories?.map((category: Category) => {
      const tags = tagListArray(category.tagList);
      const isExcluded = !tags.some((tag) => {
        const value = excludeCategoryIds?.[tag]?.[category.id];

        return value !== undefined && _isEmpty(value);
      });

      return {
        bottomDivider: true,
        categoryId: category.id,
        iconName: category.iconName,
        id: category.id,
        isDisabled: !permission,
        onActivate: () =>
          setSelectedCategoryIds((prev) => prev.filter((item) => item.id !== category.id)),
        onDeactivate: () => setSelectedCategoryIds((prev) => [...prev, { id: category.id, tags }]),
        title: category.name,
        value: isExcluded
      };
    });

    return parsedListItems?.sort((a, b) => a.title.localeCompare(b.title)) || [];
  }, [data, permission, excludeCategoryIds]);

  if (loading) {
    return <LoadingSpinner loading />;
  }

  return (
    <>
      <WrapperHorizontal>
        <SettingsToggle
          item={{
            onActivate,
            onDeactivate,
            title:
              settingsScreenListItemTitles.pushNotifications ||
              texts.settingsTitles.pushNotifications,
            topDivider: false,
            value: permission
          }}
        />
      </WrapperHorizontal>
      <FlatList
        data={listItems}
        keyExtractor={keyExtractor}
        ListHeaderComponent={
          <Wrapper noPaddingBottom>
            <RegularText small placeholder>
              {personalizedPush.categories?.sectionTitle ||
                texts.settingsContents.personalizedPush.sectionTitle}
            </RegularText>
          </Wrapper>
        }
        renderItem={({ item }) => (
          <WrapperHorizontal>
            <SettingsToggle item={item} />
          </WrapperHorizontal>
        )}
      />
    </>
  );
};
