import { FlashList } from '@shopify/flash-list';
import _camelCase from 'lodash/camelCase';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { SearchBar } from 'react-native-elements';
import { useQueries, useQuery } from 'react-query';

import {
  DefaultKeyboardAvoidingView,
  EmptyMessage,
  RegularText,
  SafeAreaViewFlex,
  Wrapper
} from '../components';
import { colors, device, Icon, texts } from '../config';
import { parseListItemsFromQuery } from '../helpers';
import { useRenderItem } from '../hooks';
import { getQuery, QUERY_TYPES } from '../queries';
import { ReactQueryClient } from '../ReactQueryClient';
import { SettingsContext } from '../SettingsProvider';

const MAX_INITIAL_NUM_TO_RENDER = 15;
const defaultFilter = ['news_item', 'event_record', 'point_of_interest', 'tour'];

const pluralizeRecordType = (recordType: string) => {
  switch (_camelCase(recordType)) {
    case QUERY_TYPES.NEWS_ITEM:
      return QUERY_TYPES.NEWS_ITEMS;
    case QUERY_TYPES.EVENT_RECORD:
      return QUERY_TYPES.EVENT_RECORDS;
    case QUERY_TYPES.POINT_OF_INTEREST:
      return QUERY_TYPES.POINTS_OF_INTEREST;
    case QUERY_TYPES.TOUR:
      return QUERY_TYPES.TOURS;
    default:
      return recordType;
  }
};

const keyExtractor = (item: { id?: any } | string, index: any) => {
  if (typeof item === 'string') {
    return `index${index}-header${item}`;
  }

  return `index${index}-id${item.id}`;
};

export const SearchScreen = ({ navigation }) => {
  const { globalSettings } = useContext(SettingsContext);
  const { sections: sectionsGlobalSettings = {}, settings = {} } = globalSettings;
  const { search: searchSettings = {} } = settings;
  const {
    minSearchLength = 3,
    filter = defaultFilter,
    texts: searchSettingsTexts = {}
  } = searchSettings;
  const searchTexts = { ...texts.search, ...searchSettingsTexts };
  const flashListRef = useRef();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceTimeoutRef = useRef(null);
  const reactQueryClientRef = useRef(null);
  const searchBarRef = useRef(null);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchBarRef?.current?.focus();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchBarRef]);

  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(search);
    }, 600);

    return () => clearTimeout(debounceTimeoutRef.current);
  }, [search]);

  const query = QUERY_TYPES.SEARCH;
  const queryVariables = {
    query: debouncedSearch,
    filter
  };

  const { data, isLoading } = useQuery(
    [query, queryVariables],
    async () => {
      if (!reactQueryClientRef.current) {
        reactQueryClientRef.current = await ReactQueryClient();
      }

      return await reactQueryClientRef.current.request(getQuery(query), queryVariables);
    },
    {
      enabled: !!search && search.length >= minSearchLength
    }
  );

  const sections = useMemo(() => {
    if (!data?.[query]) return [];

    const sectionsFromData = [];

    data?.[query].forEach((item) => {
      if (!item.id || !item.recordType) return;

      const recordType = item.recordType;

      let section = sectionsFromData.find((s) => s.recordType === recordType);

      if (!section) {
        section = {
          ids: [],
          recordType,
          title: searchTexts.recordTypes?.[_camelCase(recordType)] || recordType
        };
        sectionsFromData.push(section);
      }

      section.ids.push(item.id);
    });

    return sectionsFromData;
  }, [data, query, searchTexts]);

  const recordTypeQueries = useQueries(
    sections.map((section) => ({
      queryKey: [section.recordType, section.ids],
      queryFn: async () => {
        if (!reactQueryClientRef.current) {
          reactQueryClientRef.current = await ReactQueryClient();
        }

        return reactQueryClientRef.current.request(
          getQuery(pluralizeRecordType(section.recordType)),
          {
            ids: section.ids
          }
        );
      },
      enabled: section.ids.length > 0
    }))
  );

  const sectionedData = useMemo(() => {
    const sectionedDataFromSections = [];

    sections.forEach((section, index) => {
      const recordTypeQuery = recordTypeQueries[index];
      const innerQuery = pluralizeRecordType(section.recordType);
      const items = parseListItemsFromQuery(
        innerQuery,
        recordTypeQuery?.data,
        innerQuery === QUERY_TYPES.NEWS_ITEMS
          ? sectionsGlobalSettings?.categoriesNews?.[0].categoryTitleDetail ||
              texts.detailTitles.newsItem
          : undefined,
        {
          withDate: false,
          withTime: innerQuery === QUERY_TYPES.EVENT_RECORDS
        }
      );

      if (!items || items.length === 0) return;

      sectionedDataFromSections.push(section.title);
      sectionedDataFromSections.push(items);
    });

    return sectionedDataFromSections;
  }, [sections, recordTypeQueries]);

  const groupKey = 'recordType';
  const stickyHeaderIndices = useMemo(
    () =>
      sectionedData
        .map((item, index) => {
          if (typeof item === 'string') {
            return index;
          } else {
            return null;
          }
        })
        .filter((item) => item !== null),
    [sectionedData]
  );

  const renderItem = useRenderItem(query, navigation, {
    queryVariables: { ...queryVariables, groupKey }
  });

  return (
    <SafeAreaViewFlex>
      <DefaultKeyboardAvoidingView>
        <SearchBar
          cancelButtonProps={{
            accessibilityLabel: searchTexts.abort,
            color: colors.darkerPrimary
          }}
          cancelButtonTitle={searchTexts.abort}
          clearIcon={() => (
            <TouchableOpacity activeOpacity={1} onPress={() => searchBarRef?.current?.clear?.()}>
              <Icon.Close color={colors.darkerPrimary} />
            </TouchableOpacity>
          )}
          inputContainerStyle={styles.inputContainerStyle}
          lightTheme
          loadingProps={{
            color: colors.darkerPrimary
          }}
          onChangeText={setSearch}
          placeholder={searchTexts.placeholder}
          placeholderTextColor={colors.placeholder}
          platform={device.platform === 'ios' ? device.platform : 'default'}
          ref={searchBarRef}
          searchIcon={() => <Icon.Search color={colors.darkerPrimary} />}
          showCancel
          showLoading={isLoading}
          value={search}
        />
        <FlashList
          data={sectionedData}
          estimatedItemSize={MAX_INITIAL_NUM_TO_RENDER}
          ItemSeparatorComponent={null}
          keyboardShouldPersistTaps="handled"
          keyExtractor={keyExtractor}
          ListEmptyComponent={
            !isLoading && search.length >= minSearchLength ? (
              <EmptyMessage title={searchTexts.noResults} />
            ) : (
              !isLoading && (
                <Wrapper>
                  <RegularText placeholder small center>
                    {searchTexts.pleaseSearch}
                  </RegularText>
                </Wrapper>
              )
            )
          }
          ref={flashListRef}
          renderItem={renderItem}
          stickyHeaderIndices={stickyHeaderIndices}
        />
      </DefaultKeyboardAvoidingView>
    </SafeAreaViewFlex>
  );
};

const styles = StyleSheet.create({
  inputContainerStyle: {
    backgroundColor: colors.backgroundRgba
  }
});
