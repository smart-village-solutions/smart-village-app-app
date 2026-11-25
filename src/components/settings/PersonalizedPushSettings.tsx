import _cloneDeep from 'lodash/cloneDeep';
import _isEmpty from 'lodash/isEmpty';
import React, {
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
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
const EVENT_CATEGORY_TAG = 'event_record';

const PERSONALIZED_PUSH_SETTINGS = 'PERSONALIZED_PUSH_SETTINGS';

type Category = {
  id: string | number | null;
  name: string | null;
  tagList: string[] | string | null;
};

type CategoryPreference = { id: string; tags: string[] };
type ExcludeMap = Record<string, Record<string, unknown>>;

const keyExtractor = ({ key }: { key: string }) => key;

const tagListArray = (tag: unknown): string[] => {
  return Array.isArray(tag)
    ? tag
    : typeof tag === 'string'
    ? tag.split(',').map((x) => x.trim())
    : [];
};

const groupCategories = (categories: Category[] | undefined, configuredTags: string[]) => {
  const regular: Array<CategoryPreference & { name: string }> = [];
  const events: typeof regular = [];
  const showEventSection = configuredTags.includes(EVENT_CATEGORY_TAG);
  for (const category of categories ?? []) {
    if (!category?.name || category.id == null) continue;
    const { id, name } = category;
    const tags = tagListArray(category.tagList).filter(
      (tag) => !configuredTags.length || configuredTags.includes(tag)
    );
    if (showEventSection && tags.includes(EVENT_CATEGORY_TAG)) {
      events.push({ id: String(id), name, tags: [EVENT_CATEGORY_TAG] });
    }
    const regularTags = showEventSection ? tags.filter((tag) => tag !== EVENT_CATEGORY_TAG) : tags;
    if (regularTags.length) regular.push({ id: String(id), name, tags: regularTags });
  }
  const byName = (left: { name: string }, right: { name: string }) =>
    left.name.localeCompare(right.name);
  return { regular: regular.sort(byName), events: events.sort(byName), showEventSection };
};

export const PersonalizedPushSettings = ({
  children,
  footer,
  showRemotePush = true
}: {
  children?: ReactNode;
  footer?: React.ReactElement | null;
  showRemotePush?: boolean;
}) => {
  const { globalSettings } = useContext(SettingsContext);
  const { settings = {} } = globalSettings;
  const { personalizedPush = {}, settingsScreenListItemTitles = {} } = settings;
  const queryVariables = personalizedPush.categories?.queryVariables || DEFAULT_QUERY_VARIABLES;
  const configuredTags = useMemo(
    () => tagListArray(queryVariables.tagList),
    [queryVariables.tagList]
  );
  const hasRemoteCategories = showRemotePush && !!personalizedPush.categories;

  const [permission, setPermission] = useState<boolean>(false);
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [busy, setBusy] = useState(true);
  const [preferencesToken, setPreferencesToken] = useState<string | null>(null);
  const [settledPreferencesToken, setSettledPreferencesToken] = useState<string | null>(null);
  const categoryToken = hasRemoteCategories && permission ? pushToken : null;
  const preferencesLoaded = !!categoryToken && preferencesToken === categoryToken;
  const loadingPreferences = !!categoryToken && settledPreferencesToken !== categoryToken;
  const operationInProgress = useRef(false);
  const [excludeCategoryIds, setExcludeCategoryIds] = useState<ExcludeMap>({});

  const { data, isLoading: loading } = useQuery(
    [QUERY_TYPES.CATEGORIES_FILTER, queryVariables],
    async () => {
      const client = await ReactQueryClient();

      return await client.request(getQuery(QUERY_TYPES.CATEGORIES_FILTER), queryVariables);
    },
    {
      enabled: hasRemoteCategories
    }
  );

  const addIdsOnServer = useCallback(
    async (categories: { id: string; tags: string[] }[], token: string, base: ExcludeMap) => {
      const categoryIds: ExcludeMap = _cloneDeep(base);
      const selectedByTag = new Map<string, Set<string>>();

      categories.forEach(({ id, tags }) => {
        tagListArray(tags)?.forEach((t) => {
          if (!selectedByTag.has(t)) selectedByTag.set(t, new Set());
          const set = selectedByTag.get(t);
          if (set) set.add(String(id));
        });
      });

      configuredTags.forEach((t) => {
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
    [configuredTags]
  );

  useEffect(() => {
    if (!showRemotePush) return;
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
  }, [showRemotePush]);

  useEffect(() => {
    let cancelled = false;

    if (!categoryToken) return;

    (async () => {
      try {
        const categories = await getExcludeNotificationConfigurationFromServer(categoryToken);

        // A failed read must never replace existing preferences or trigger a write.
        if (cancelled || !categories) return;

        const storedCategories = await readFromStore(PERSONALIZED_PUSH_SETTINGS);

        if (cancelled) return;

        let nextCategories = categories;

        if (Array.isArray(storedCategories)) {
          const syncedCategories = await addIdsOnServer(
            storedCategories,
            categoryToken,
            categories
          );

          if (cancelled || !syncedCategories) return;
          nextCategories = syncedCategories;
          await removeFromStore(PERSONALIZED_PUSH_SETTINGS);
        }

        if (!cancelled) {
          setExcludeCategoryIds(nextCategories);
          setPreferencesToken(categoryToken);
        }
      } catch {
        console.warn('Could not load push notification preferences.');
      } finally {
        if (!cancelled) setSettledPreferencesToken(categoryToken);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [addIdsOnServer, categoryToken]);

  const selectedCategoryIds = useMemo(
    () =>
      Object.entries(excludeCategoryIds).flatMap(([tag, items]) =>
        Object.keys(items).map((id) => ({ id, tags: [tag] }))
      ),
    [excludeCategoryIds]
  );

  const changeCategories = useCallback(
    async ({ id, tags }: CategoryPreference, excluded: boolean, revert: () => void) => {
      if (operationInProgress.current || !pushToken || !preferencesLoaded) {
        revert?.();
        return;
      }

      operationInProgress.current = true;
      setBusy(true);
      try {
        const nextCategories = { ...excludeCategoryIds };
        for (const tag of tags) {
          const entries = { ...nextCategories[tag] };
          if (excluded) entries[id] = {};
          else delete entries[id];
          nextCategories[tag] = entries;
        }
        const success = await addExcludeNotificationConfigurationOnServer(
          pushToken,
          nextCategories
        );
        if (success) setExcludeCategoryIds(nextCategories);
        else revert?.();
      } catch {
        console.warn('Could not save push notification preferences.');
        revert?.();
      } finally {
        operationInProgress.current = false;
        setBusy(false);
      }
    },
    [excludeCategoryIds, preferencesLoaded, pushToken]
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

  const { regular, events, showEventSection } = useMemo(
    () => groupCategories(hasRemoteCategories ? data?.categories : undefined, configuredTags),
    [configuredTags, data, hasRemoteCategories]
  );

  const listItems = useMemo(() => {
    const toToggle = (section: string, category: CategoryPreference & { name: string }) => {
      const { id, tags, name } = category;
      const isExcluded = !tags.some((tag) => {
        const value = excludeCategoryIds?.[tag]?.[id];

        return value !== undefined && _isEmpty(value);
      });

      return {
        key: `${section}:${id}`,
        item: {
          bottomDivider: true,
          isDisabled: busy || !permission || !preferencesLoaded,
          onActivate: (revert: () => void) => changeCategories(category, false, revert),
          onDeactivate: (revert: () => void) => changeCategories(category, true, revert),
          title: name,
          value: isExcluded
        }
      };
    };

    return [
      ...regular.map((category) => toToggle('regular', category)),
      ...events.map((category) => toToggle(EVENT_CATEGORY_TAG, category))
    ];
  }, [busy, changeCategories, events, regular, permission, preferencesLoaded, excludeCategoryIds]);

  const renderCategoryHeading = () => {
    if (!hasRemoteCategories) return null;
    if (showEventSection && !regular.length && !loading) return null;
    return loading ? (
      <LoadingSpinner loading />
    ) : (
      <Wrapper noPaddingBottom>
        <RegularText small placeholder>
          {personalizedPush.categories?.sectionTitle ||
            texts.settingsContents.personalizedPush.sectionTitle}
        </RegularText>
      </Wrapper>
    );
  };

  const renderRemoteToggle = () =>
    showRemotePush && (
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
    );

  if (loading && !footer) {
    return (
      <>
        <WrapperHorizontal>{children}</WrapperHorizontal>
        <LoadingSpinner loading />
      </>
    );
  }

  return (
    <>
      <WrapperHorizontal>
        {renderRemoteToggle()}
        {children}
      </WrapperHorizontal>
      <FlatList
        data={listItems}
        keyExtractor={keyExtractor}
        ListFooterComponent={footer}
        ListHeaderComponent={renderCategoryHeading()}
        renderItem={({ item: row, index }) => (
          <>
            {!!events.length && index === regular.length && (
              <Wrapper noPaddingBottom>
                <RegularText small placeholder>
                  {texts.settingsContents.personalizedPush.eventSectionTitle}
                </RegularText>
              </Wrapper>
            )}
            <WrapperHorizontal>
              <SettingsToggle item={row.item} />
            </WrapperHorizontal>
          </>
        )}
      />
    </>
  );
};
