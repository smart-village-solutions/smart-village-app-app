import _isArray from 'lodash/isArray';
import moment from 'moment';
import React, { useCallback, useContext } from 'react';
import { StyleSheet, View } from 'react-native';

import { SettingsContext } from '../SettingsProvider';
import {
  ConversationListItem,
  GroupedListItem,
  GroupedSectionHeader,
  SectionHeader,
  VoucherListItem,
  WasteCollectionListItem
} from '../components';
import { CardListItem } from '../components/CardListItem';
import { TextListItem } from '../components/TextListItem';
import { VolunteerApplicantListItem } from '../components/volunteer/VolunteerApplicantListItem';
import { VolunteerConversationListItem } from '../components/volunteer/VolunteerConversationListItem';
import { VolunteerPostListItem } from '../components/volunteer/VolunteerPostListItem';
import { consts, normalize, texts } from '../config';
import { momentFormat } from '../helpers';
import { QUERY_TYPES } from '../queries';
import { ScreenName } from '../types';

const { LIST_TYPES, ROOT_ROUTE_NAMES } = consts;

const getListType = (query, listTypesSettings) => {
  switch (query) {
    case QUERY_TYPES.POINTS_OF_INTEREST:
    case QUERY_TYPES.TOURS:
      return listTypesSettings[QUERY_TYPES.POINTS_OF_INTEREST_AND_TOURS];
    default:
      return listTypesSettings[query];
  }
};

const EventSectionHeader = ({ item, navigation, options, query }) => (
  <SectionHeader
    title={momentFormat(item, 'DD.MM.YYYY dddd')}
    containerStyle={styles.sectionHeaderContainer}
    onPress={
      navigation
        ? () =>
            navigation.push(ScreenName.Index, {
              title: texts.homeTitles.events,
              query,
              queryVariables: {
                ...options.queryVariables,
                dateRange: [momentFormat(item, 'YYYY-MM-DD'), momentFormat(item, 'YYYY-MM-DD')]
              },
              rootRouteName: ROOT_ROUTE_NAMES.EVENT_RECORDS
            })
        : undefined
    }
  />
);

const VoucherCategoryHeader = ({ item, navigation, options, query }) => (
  <SectionHeader
    title={item.name}
    onPress={
      navigation
        ? () =>
            navigation.push(options.queryVariables?.screenName || ScreenName.BookmarkCategory, {
              title: texts.screenTitles.voucher.index,
              query,
              queryVariables: {
                ...options.queryVariables,
                categoryId: item.id,
                category: item.name
              },
              rootRouteName: ROOT_ROUTE_NAMES.VOUCHER
            })
        : undefined
    }
  />
);

/**
 * this hook creates a render item function wrapped in a useCallback depending on the given options,
 * as well as on the listTypesSettings of the SettingsContext
 * @param {string} query
 * @param {any} navigation
 * @param {{
 *          horizontal?: boolean;
 *          isIndexStartingAt1?: boolean;
 *          listType?: boolean;
 *          noOvertitle?: boolean;
 *          noSubtitle?: boolean;
 *          openWebScreen?: () => void;
 *          queryVariables?: object;
 *          refetch?: () => void;
 *        }} options
 * @returns renderItem function
 */
export const useRenderItem = (query, navigation, options = {}) => {
  const { globalSettings, listTypesSettings } = useContext(SettingsContext);
  const { settings = {} } = globalSettings;
  const { listsWithoutArrows = false } = settings;
  const listType = options.listType || getListType(query, listTypesSettings);
  let renderItem;

  const calculateBottomDivider = (item, index, section) => {
    return (
      item.bottomDivider ??
      (_isArray(section?.data) ? section.data.length - 1 !== index : undefined)
    );
  };

  switch (listType) {
    case LIST_TYPES.CARD_LIST: {
      renderItem = ({ item, index, section, target }) => {
        if (query === QUERY_TYPES.EVENT_RECORDS && typeof item === 'string') {
          return (
            <View style={target == 'StickyHeader' ? styles.eventStickyHeader : styles.eventHeader}>
              <EventSectionHeader {...{ item, navigation, options, query }} />
            </View>
          );
        }

        return (
          <CardListItem
            navigation={navigation}
            horizontal={options.horizontal}
            noOvertitle={options.noOvertitle}
            item={item}
            index={index}
          />
        );
      };
      break;
    }
    case LIST_TYPES.CARD_TEXT_LIST: {
      renderItem = ({ item, index, section, target }) => {
        if (query === QUERY_TYPES.EVENT_RECORDS && typeof item === 'string') {
          return (
            <View style={target == 'StickyHeader' ? styles.eventStickyHeader : styles.eventHeader}>
              <EventSectionHeader {...{ item, navigation, options, query }} />
            </View>
          );
        }

        // in special lists such as `EventList`, since the data starts from the 1st index,
        // `isIndexStartingAt1` and `index` control has been added
        if (
          (index === 0 && !options.isIndexStartingAt1) ||
          (index === 1 && options.isIndexStartingAt1)
        ) {
          if (!item?.picture?.url) {
            return (
              <TextListItem
                item={{ ...item, bottomDivider: true }}
                navigation={navigation}
                noSubtitle={options.noSubtitle}
                noOvertitle={options.noOvertitle}
                withCard
              />
            );
          }
        }

        if (index === 0) {
          return (
            <CardListItem
              bigTitle
              horizontal={options.horizontal}
              index={index}
              item={item}
              navigation={navigation}
              noOvertitle={options.noOvertitle}
            />
          );
        } else {
          return (
            <TextListItem
              item={{
                ...item,
                bottomDivider: calculateBottomDivider(item, index, section)
              }}
              navigation={navigation}
              noSubtitle={options.noSubtitle}
              noOvertitle={options.noOvertitle}
              leftImage
              withCard
            />
          );
        }
      };
      break;
    }
    case LIST_TYPES.GROUPED_LIST: {
      renderItem = ({ item }) => {
        if (typeof item === 'string') {
          return <GroupedSectionHeader item={item} />;
        }

        if (query === QUERY_TYPES.WASTE_STREET) {
          return <WasteCollectionListItem item={item} options={options.queryVariables} />;
        }

        return (
          <GroupedListItem item={item} navigation={navigation} options={options.queryVariables} />
        );
      };
      break;
    }
    case LIST_TYPES.IMAGE_TEXT_LIST: {
      renderItem = ({ item, index, section, target }) => {
        if (query === QUERY_TYPES.EVENT_RECORDS && typeof item === 'string') {
          return (
            <View style={target == 'StickyHeader' ? styles.eventStickyHeader : styles.eventHeader}>
              <EventSectionHeader {...{ item, navigation, options, query }} />
            </View>
          );
        }

        return (
          <TextListItem
            item={{
              ...item,
              bottomDivider: calculateBottomDivider(item, index, section)
            }}
            {...{
              navigation,
              noSubtitle: options.noSubtitle,
              noOvertitle: options.noOvertitle,
              leftImage: true
            }}
          />
        );
      };
      break;
    }
    default: {
      /* eslint-disable complexity */
      renderItem = ({ item, index, section, target }) => {
        if (query === QUERY_TYPES.PROFILE.GET_CONVERSATIONS) {
          return (
            <ConversationListItem
              {...{ item, navigation, currentUserId: options.queryVariables?.currentUserId }}
            />
          );
        }

        if (query === QUERY_TYPES.SUE.REQUESTS) {
          return <CardListItem navigation={navigation} item={item} index={index} sue />;
        }

        if (query === QUERY_TYPES.VOLUNTEER.POSTS) {
          return (
            <VolunteerPostListItem
              bottomDivider={false}
              openWebScreen={options.openWebScreen}
              post={item}
              userGuid={options.queryVariables?.userGuid}
            />
          );
        }

        if (query === QUERY_TYPES.VOLUNTEER.CONVERSATIONS) {
          return <VolunteerConversationListItem item={item} navigation={navigation} />;
        }

        if (query === QUERY_TYPES.VOLUNTEER.APPLICANTS) {
          return (
            <VolunteerApplicantListItem
              item={{
                ...item,
                bottomDivider: calculateBottomDivider(item, index, section)
              }}
              refetch={options.refetch}
              navigation={navigation}
            />
          );
        }

        if (query === QUERY_TYPES.VOUCHERS || query === QUERY_TYPES.VOUCHERS_REDEEMED) {
          if (typeof item === 'object' && Object.keys(item).length === 2) {
            return <VoucherCategoryHeader {...{ item, navigation, options, query }} />;
          }

          return <VoucherListItem navigation={navigation} item={item} />;
        }

        // `SectionHeader` list item for `EventList`
        if (query === QUERY_TYPES.EVENT_RECORDS && typeof item === 'string') {
          return (
            <View style={target == 'StickyHeader' ? styles.eventStickyHeader : styles.eventHeader}>
              <EventSectionHeader {...{ item, navigation, options, query }} />
            </View>
          );
        }

        // `SectionHeader` list item for `Noticeboard`
        if (query === QUERY_TYPES.GENERIC_ITEMS && !!item.component) {
          return item.component;
        }

        return (
          <TextListItem
            item={{
              ...item,
              bottomDivider: calculateBottomDivider(item, index, section)
            }}
            {...{
              navigation,
              noSubtitle: options.noSubtitle,
              noOvertitle: options.noOvertitle,
              listsWithoutArrows
            }}
          />
        );
      };
      /* eslint-enable complexity */

      break;
    }
  }

  return useCallback(renderItem, [
    query,
    listType,
    navigation,
    options.horizontal,
    options.noSubtitle,
    options.queryVariables
  ]);
};

/**
 * useGroupedData is a custom React hook that groups an array of objects based on their given key.
 *
 * @param {string} query - String used to specify the method of grouping.
 * @param {Array} data - An array of objects to be grouped. Objects should contain a property with the date format "YYYY-MM-DD".
 * @param {Array} groupKey - The key used to group the data.
 * @returns {Array} The returned array contains grouped objects and their corresponding month. Each month is followed by objects published in it.
 *
 * @inner
 * @function groupDataByDate - Groups data based on given `groupKey`.
 * @function transformGroupedDataToArray - Converts grouped data into an easily consumable format.
 * @note: Currently, this hook only supports grouping by date. For other types of grouping, the hook needs to be updated.
 */
export const useGroupedData = (query, data, groupKey) => {
  switch (query) {
    default: {
      const groupDataByDate = () => {
        const grouped = {};

        data.forEach((item) => {
          if (item[groupKey]) {
            const dateKey = momentFormat(item[groupKey]);

            if (!grouped[dateKey]) {
              grouped[dateKey] = [];
            }

            grouped[dateKey].push(item);
          }
        });

        return grouped;
      };

      const transformGroupedDataToArray = (groupedData) => {
        const resultArray = [];
        let section;
        const currentYear = moment().format('YYYY');

        for (const date in groupedData) {
          let month = momentFormat(date, 'MMMM', 'DD.MM.YYYY');
          const dateYear = date.split('.')[2];

          if (dateYear !== currentYear) {
            month = momentFormat(date, 'MMMM YYYY', 'DD.MM.YYYY');
          }

          if (section !== month) {
            resultArray.push(month);
            section = month;
          }

          resultArray.push(groupedData[date]);
        }

        return resultArray;
      };

      return transformGroupedDataToArray(groupDataByDate());
    }
  }
};

const styles = StyleSheet.create({
  eventHeader: {
    marginLeft: -normalize(16),
    marginRight: -normalize(16)
  },
  eventStickyHeader: {
    marginLeft: 0,
    marginRight: 0
  },
  sectionHeaderContainer: {
    paddingTop: normalize(16)
  }
});
