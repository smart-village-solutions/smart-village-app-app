import React, { useContext, useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { useQuery } from 'react-query';

import { ReactQueryClient } from '../../ReactQueryClient';
import { SettingsContext } from '../../SettingsProvider';
import { normalize, texts } from '../../config';
import { getInAppPermission } from '../../pushNotifications';
import { getQuery, QUERY_TYPES } from '../../queries';
import { onActivatePushNotifications, onDeactivatePushNotifications } from '../../screens';
import { LoadingSpinner } from '../LoadingSpinner';
import { SafeAreaViewFlex } from '../SafeAreaViewFlex';
import { SettingsToggle } from '../SettingsToggle';

type Category = { id: string; iconName?: string | null; name: string };

const keyExtractor = (item, index) => `index${index}-id${item.id}`;

export const PersonalizedPushSettings = () => {
  const { globalSettings } = useContext(SettingsContext);
  const { settings = {} } = globalSettings;
  const { personalizedPush = {}, settingsScreenListItemTitles = {} } = settings;
  const queryVariables = personalizedPush.variables || {
    tagList: ['news_item']
  };

  const [permission, setPermission] = useState<boolean>(false);

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

    const parsedListItems = categories.map((category) => ({
      iconName: category.iconName,
      id: category.id,
      isDisabled: !permission,
      // TODO: the necessary functions to activate and deactivate the push by category will be updated
      onActivate: onActivatePushNotifications,
      onDeactivate: onDeactivatePushNotifications,
      title: category.name,
      topDivider: true,
      // TODO: The value will then depend on the response from the api
      value: true
    }));

    return [initialListItem, ...parsedListItems];
  }, [data, permission]);

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
