import { decodeHTMLStrict } from 'entities';
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
import { AppState, DeviceEventEmitter, FlatList } from 'react-native';
import { useQuery } from 'react-query';

import { ReactQueryClient } from '../../ReactQueryClient';
import { SettingsContext } from '../../SettingsProvider';
import { texts } from '../../config';
import { EVENT_CATEGORY_TAG } from '../../helpers/eventReminderPlan';
import {
  addExcludeNotificationConfigurationOnServer,
  getExcludeNotificationConfigurationFromServer,
  getInAppPermission,
  getLocalNotificationPermission,
  getPushTokenFromStorage,
  PUSH_NOTIFICATION_PERMISSION_CHANGED_EVENT,
  PUSH_NOTIFICATION_TOKEN_CHANGED_EVENT
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

const remoteCategories = (categories: Category[] | undefined, configuredTags: string[]) =>
  (categories ?? [])
    .flatMap((category) => {
      if (!category?.name || category.id == null) return [];
      const tags = tagListArray(category.tagList).filter(
        (tag) =>
          tag !== EVENT_CATEGORY_TAG && (!configuredTags.length || configuredTags.includes(tag))
      );
      return tags.length
        ? [{ id: String(category.id), name: decodeHTMLStrict(category.name), tags }]
        : [];
    })
    .sort((left, right) => left.name.localeCompare(right.name));

const getRemoteCategoryConfiguration = (queryVariables: { tagList?: unknown }) => {
  const tags = tagListArray(queryVariables.tagList);
  const configuredTags = tags.filter((tag) => tag !== EVENT_CATEGORY_TAG);
  return {
    configuredTags,
    hasRemoteTags: !tags.length || !!configuredTags.length,
    remoteQueryVariables: tags.includes(EVENT_CATEGORY_TAG)
      ? { ...queryVariables, tagList: configuredTags }
      : queryVariables
  };
};

export const PersonalizedPushSettings = ({
  children,
  footer,
  showRemotePush = true
}: {
  children?: ReactNode;
  footer?: (notificationsAllowed: boolean) => React.ReactElement;
  showRemotePush?: boolean;
}) => {
  const { globalSettings } = useContext(SettingsContext);
  const { settings = {} } = globalSettings;
  const { personalizedPush = {}, settingsScreenListItemTitles = {} } = settings;
  const queryVariables = personalizedPush.categories?.queryVariables || DEFAULT_QUERY_VARIABLES;
  const { configuredTags, hasRemoteTags, remoteQueryVariables } = useMemo(
    () => getRemoteCategoryConfiguration(queryVariables),
    [queryVariables]
  );
  const hasRemoteCategories = showRemotePush && !!personalizedPush.categories && hasRemoteTags;
  const hasEventReminders = !!footer || !!children;
  const showPushToggle = showRemotePush || hasEventReminders;

  const [permission, setPermission] = useState<boolean>(false);
  const [systemPermission, setSystemPermission] = useState(false);
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [busy, setBusy] = useState(true);
  const [preferencesToken, setPreferencesToken] = useState<string | null>(null);
  const [settledPreferencesToken, setSettledPreferencesToken] = useState<string | null>(null);
  const notificationsAllowed = permission && systemPermission;
  const categoryToken = hasRemoteCategories && permission ? pushToken : null;
  const preferencesLoaded = !!categoryToken && preferencesToken === categoryToken;
  const loadingPreferences = !!categoryToken && settledPreferencesToken !== categoryToken;
  const operationInProgress = useRef(false);
  const [excludeCategoryIds, setExcludeCategoryIds] = useState<ExcludeMap>({});

  const { data, isLoading: loading } = useQuery(
    [QUERY_TYPES.CATEGORIES_FILTER, remoteQueryVariables],
    async () => {
      const client = await ReactQueryClient();

      return await client.request(getQuery(QUERY_TYPES.CATEGORIES_FILTER), remoteQueryVariables);
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
    if (!showPushToggle) return;
    let revision = 0;

    const refresh = async () => {
      const check = ++revision;
      try {
        const [inAppPermission, storedToken] = await Promise.all([
          getInAppPermission(),
          showRemotePush ? getPushTokenFromStorage().catch(() => undefined) : null
        ]);

        if (check === revision) {
          setPermission(!!inAppPermission);
          if (storedToken !== undefined) setPushToken(storedToken);
        }
      } catch {
        console.warn('Could not load push notification settings.');
      } finally {
        if (check === revision && !operationInProgress.current) setBusy(false);
      }
    };
    const permissionChange = DeviceEventEmitter.addListener(
      PUSH_NOTIFICATION_PERMISSION_CHANGED_EVENT,
      refresh
    );
    const tokenChange = showRemotePush
      ? DeviceEventEmitter.addListener(PUSH_NOTIFICATION_TOKEN_CHANGED_EVENT, refresh)
      : undefined;
    void refresh();

    return () => {
      ++revision;
      permissionChange.remove();
      tokenChange?.remove();
    };
  }, [showPushToggle, showRemotePush]);

  useEffect(() => {
    if (!showPushToggle) return;
    let latestCheck = 0;
    const refresh = async () => {
      const check = ++latestCheck;
      const allowed = await getLocalNotificationPermission().catch(() => false);
      if (check === latestCheck) setSystemPermission(allowed);
    };
    const appStateChange = AppState.addEventListener('change', (state) => {
      if (state === 'active') void refresh();
      else ++latestCheck;
    });
    void refresh();
    return () => {
      ++latestCheck;
      appStateChange.remove();
    };
  }, [showPushToggle]);

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
      if (
        operationInProgress.current ||
        !notificationsAllowed ||
        !pushToken ||
        !preferencesLoaded
      ) {
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
    [excludeCategoryIds, notificationsAllowed, preferencesLoaded, pushToken]
  );

  const onActivate = async (revert: () => void) => {
    if (operationInProgress.current) {
      revert?.();
      return;
    }

    operationInProgress.current = true;
    setBusy(true);
    try {
      const success = hasEventReminders
        ? await onActivatePushNotifications(revert, showRemotePush, true)
        : await onActivatePushNotifications(revert);

      if (!success) return;

      if (!hasEventReminders) setPushToken(await getPushTokenFromStorage());
      setPermission(true);
      setSystemPermission(await getLocalNotificationPermission().catch(() => false));
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
        const backup = addToStore(PERSONALIZED_PUSH_SETTINGS, selectedCategoryIds);
        if (hasEventReminders) await backup.catch(() => undefined);
        else await backup;
      }

      const success = hasEventReminders
        ? await onDeactivatePushNotifications(revert, showRemotePush, true)
        : await onDeactivatePushNotifications(revert);

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

  const categories = useMemo(
    () => remoteCategories(hasRemoteCategories ? data?.categories : undefined, configuredTags),
    [configuredTags, data, hasRemoteCategories]
  );

  const listItems = useMemo(() => {
    const toToggle = (category: CategoryPreference & { name: string }) => {
      const { id, tags, name } = category;
      const isExcluded = !tags.some((tag) => {
        const value = excludeCategoryIds?.[tag]?.[id];

        return value !== undefined && _isEmpty(value);
      });

      return {
        key: id,
        item: {
          bottomDivider: true,
          isDisabled: busy || !notificationsAllowed || !preferencesLoaded,
          onActivate: (revert: () => void) => changeCategories(category, false, revert),
          onDeactivate: (revert: () => void) => changeCategories(category, true, revert),
          title: name,
          value: notificationsAllowed && preferencesLoaded && isExcluded
        }
      };
    };

    return categories.map(toToggle);
  }, [
    busy,
    changeCategories,
    categories,
    notificationsAllowed,
    preferencesLoaded,
    excludeCategoryIds
  ]);

  const renderCategoryHeading = () => {
    if (!hasRemoteCategories) return null;
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
    showPushToggle && (
      <SettingsToggle
        needsConnection={!hasEventReminders}
        item={{
          isDisabled: busy || (!hasEventReminders && loadingPreferences),
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

  return (
    <>
      <WrapperHorizontal>
        {renderRemoteToggle()}
        {children}
      </WrapperHorizontal>
      <FlatList
        data={listItems}
        keyExtractor={keyExtractor}
        ListFooterComponent={footer?.(notificationsAllowed)}
        ListHeaderComponent={renderCategoryHeading()}
        renderItem={({ item: row }) => (
          <WrapperHorizontal>
            <SettingsToggle item={row.item} />
          </WrapperHorizontal>
        )}
      />
    </>
  );
};
