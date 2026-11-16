import _cloneDeep from 'lodash/cloneDeep';
import _isEmpty from 'lodash/isEmpty';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
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
import { addToStore, readFromStore, removeFromStore } from '../../helpers';

const DEFAULT_QUERY_VARIABLES = { tagList: ['news_item'] };

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
  const queryVariables = personalizedPush.categories?.queryVariables || DEFAULT_QUERY_VARIABLES;

  const [permission, setPermission] = useState<boolean>(false);
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [busy, setBusy] = useState(true);
  const [preferencesToken, setPreferencesToken] = useState<string | null>(null);
  const [settledPreferencesToken, setSettledPreferencesToken] = useState<string | null>(null);
  const preferencesLoaded = permission && !!pushToken && preferencesToken === pushToken;
  const loadingPreferences = permission && !!pushToken && settledPreferencesToken !== pushToken;
  const operationInProgress = useRef(false);
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
    async (categories: { id: string; tags: string[] }[], token: string, base: ExcludeMap) => {
      const tagList = queryVariables?.tagList ?? [];
      const categoryIds: ExcludeMap = _cloneDeep(base);
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
        const obj: Record<string, Record<string, never>> = {};

        ids.forEach((id) => {
          obj[id] = {};
        });

        categoryIds[t] = obj;
      });

      const success = await addExcludeNotificationConfigurationOnServer(token, categoryIds);

      return success ? categoryIds : undefined;
    },
    [queryVariables?.tagList]
  );

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [inAppPermission, storedToken] = await Promise.all([
          getInAppPermission(),
          getPushTokenFromStorage()
        ]);

        if (!cancelled) {
          setPermission(!!inAppPermission);
          setPushToken(storedToken);
        }
      } catch {
        console.warn('Could not load push notification settings.');
      } finally {
        if (!cancelled) setBusy(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (!permission || !pushToken) return;

    (async () => {
      try {
        const categories = await getExcludeNotificationConfigurationFromServer(pushToken);

        // A failed read must never replace existing preferences or trigger a write.
        if (cancelled || !categories) return;

        const storedCategories = await readFromStore(PERSONALIZED_PUSH_SETTINGS);

        if (cancelled) return;

        let nextCategories = categories;

        if (Array.isArray(storedCategories)) {
          const syncedCategories = await addIdsOnServer(storedCategories, pushToken, categories);

          if (cancelled || !syncedCategories) return;
          nextCategories = syncedCategories;
          await removeFromStore(PERSONALIZED_PUSH_SETTINGS);
        }

        if (!cancelled) {
          setExcludeCategoryIds(nextCategories);
          setPreferencesToken(pushToken);
        }
      } catch {
        console.warn('Could not load push notification preferences.');
      } finally {
        if (!cancelled) setSettledPreferencesToken(pushToken);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [addIdsOnServer, permission, pushToken]);

  const selectedCategoryIds = useMemo(
    () =>
      Object.entries(excludeCategoryIds).flatMap(([tag, items]) =>
        Object.keys(items).map((id) => ({ id, tags: [tag] }))
      ),
    [excludeCategoryIds]
  );

  const changeCategories = useCallback(
    async (categories: { id: string; tags: string[] }[], revert: () => void) => {
      if (operationInProgress.current || !pushToken || !preferencesLoaded) {
        revert?.();
        return;
      }

      operationInProgress.current = true;
      setBusy(true);
      try {
        const nextCategories = await addIdsOnServer(categories, pushToken, excludeCategoryIds);

        if (nextCategories) setExcludeCategoryIds(nextCategories);
        else revert?.();
      } catch {
        console.warn('Could not save push notification preferences.');
        revert?.();
      } finally {
        operationInProgress.current = false;
        setBusy(false);
      }
    },
    [addIdsOnServer, excludeCategoryIds, preferencesLoaded, pushToken]
  );

  const onActivate = async (revert: () => void) => {
    if (operationInProgress.current) {
      revert?.();
      return;
    }

    operationInProgress.current = true;
    setBusy(true);
    try {
      const success = await onActivatePushNotifications(revert);

      if (!success) return;

      const token = await getPushTokenFromStorage();

      setPushToken(token);
      setPermission(true);
    } catch {
      console.warn('Could not activate personalized push notifications.');
      revert?.();
    } finally {
      operationInProgress.current = false;
      setBusy(false);
    }
  };

  const onDeactivate = async (revert: () => void) => {
    if (operationInProgress.current) {
      revert?.();
      return;
    }

    operationInProgress.current = true;
    setBusy(true);
    try {
      // Preserve recoverable preferences before removing the device on the server.
      if (preferencesLoaded) {
        await addToStore(PERSONALIZED_PUSH_SETTINGS, selectedCategoryIds);
      }

      const success = await onDeactivatePushNotifications(revert);

      if (!success) return;

      setPermission(false);
      setPushToken(null);
      setPreferencesToken(null);
      setSettledPreferencesToken(null);
    } catch {
      console.warn('Could not deactivate personalized push notifications.');
      revert?.();
    } finally {
      operationInProgress.current = false;
      setBusy(false);
    }
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
        isDisabled: busy || !permission || !preferencesLoaded,
        onActivate: (revert: () => void) =>
          changeCategories(
            selectedCategoryIds.filter((item) => item.id !== category.id),
            revert
          ),
        onDeactivate: (revert: () => void) =>
          changeCategories([...selectedCategoryIds, { id: category.id, tags }], revert),
        title: category.name,
        value: isExcluded
      };
    });

    return parsedListItems?.sort((a, b) => a.title.localeCompare(b.title)) || [];
  }, [
    busy,
    changeCategories,
    data,
    permission,
    preferencesLoaded,
    excludeCategoryIds,
    selectedCategoryIds
  ]);

  if (loading) {
    return <LoadingSpinner loading />;
  }

  return (
    <>
      <WrapperHorizontal>
        <SettingsToggle
          item={{
            isDisabled: busy || loadingPreferences,
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
