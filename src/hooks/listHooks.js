/* eslint-disable complexity */
/* eslint-disable react/prop-types */
import { isArray } from 'lodash';
import React, { useCallback, useContext } from 'react';

import { SettingsContext } from '../SettingsProvider';
import { SectionHeader, VoucherListItem } from '../components';
import { CardListItem } from '../components/CardListItem';
import { TextListItem } from '../components/TextListItem';
import { VolunteerApplicantListItem } from '../components/volunteer/VolunteerApplicantListItem';
import { VolunteerConversationListItem } from '../components/volunteer/VolunteerConversationListItem';
import { VolunteerPostListItem } from '../components/volunteer/VolunteerPostListItem';
import { consts, texts } from '../config';
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
    onPress={() =>
      navigation.push(ScreenName.Index, {
        title: texts.homeTitles.events,
        query,
        queryVariables: {
          ...options.queryVariables,
          dateRange: [momentFormat(item, 'YYYY-MM-DD'), momentFormat(item, 'YYYY-MM-DD')]
        },
        rootRouteName: ROOT_ROUTE_NAMES.EVENT_RECORDS,
        showFilterByDailyEvents: false
      })
    }
  />
);

const VoucherCategoryHeader = ({ item, navigation, options, query }) => (
  <SectionHeader
    title={item.name}
    onPress={() =>
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
 *          isIndexStartingAt1?: boolean
 *          noSubtitle?: boolean;
 *          openWebScreen?: () => void;
 *          queryVariables?: object
 *          refetch?: () => void
 *        }} options
 * @returns renderItem function
 */
export const useRenderItem = (query, navigation, options = {}) => {
  const { listTypesSettings } = useContext(SettingsContext);

  const listType = getListType(query, listTypesSettings);

  let renderItem;

  switch (listType) {
    case LIST_TYPES.CARD_LIST: {
      renderItem = ({ item, index }) => {
        if (query === QUERY_TYPES.EVENT_RECORDS && typeof item === 'string') {
          return <EventSectionHeader {...{ item, navigation, options, query }} />;
        }

        return (
          <CardListItem
            navigation={navigation}
            horizontal={options.horizontal}
            item={item}
            index={index}
          />
        );
      };
      break;
    }
    case LIST_TYPES.IMAGE_TEXT_LIST: {
      renderItem = ({ item, index, section }) => {
        if (query === QUERY_TYPES.EVENT_RECORDS && typeof item === 'string') {
          return <EventSectionHeader {...{ item, navigation, options, query }} />;
        }

        return (
          <TextListItem
            item={{
              ...item,
              bottomDivider:
                item.bottomDivider ??
                (isArray(section?.data) ? section.data.length - 1 !== index : undefined)
            }}
            {...{ navigation, noSubtitle: options.noSubtitle, leftImage: true }}
          />
        );
      };
      break;
    }
    case LIST_TYPES.CARD_TEXT_LIST: {
      renderItem = ({ item, index, section }) => {
        if (query === QUERY_TYPES.EVENT_RECORDS && typeof item === 'string') {
          return <EventSectionHeader {...{ item, navigation, options, query }} />;
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
                withCard
              />
            );
          }

          return (
            <CardListItem
              navigation={navigation}
              horizontal={options.horizontal}
              item={item}
              index={index}
            />
          );
        } else {
          return (
            <TextListItem
              item={{
                ...item,
                bottomDivider:
                  item.bottomDivider ??
                  (isArray(section?.data) ? section.data.length - 1 !== index : undefined)
              }}
              navigation={navigation}
              noSubtitle={options.noSubtitle}
              leftImage
              withCard
            />
          );
        }
      };
      break;
    }
    default: {
      renderItem = ({ item, index, section }) => {
        if (query === QUERY_TYPES.SUE.REQUESTS) {
          return <CardListItem navigation={navigation} item={item} index={index} sue />;
        }

        if (query === QUERY_TYPES.VOLUNTEER.POSTS) {
          return (
            <VolunteerPostListItem
              post={item}
              bottomDivider={isArray(section?.data) ? section.data.length - 1 !== index : undefined}
              openWebScreen={options.openWebScreen}
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
                bottomDivider: isArray(section?.data)
                  ? section.data.length - 1 !== index
                  : undefined
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
          return <EventSectionHeader {...{ item, navigation, options, query }} />;
        }

        return (
          <TextListItem
            item={{
              ...item,
              bottomDivider: isArray(section?.data) ? section.data.length - 1 !== index : undefined
            }}
            {...{ navigation, noSubtitle: options.noSubtitle }}
          />
        );
      };

      break;
    }
  }
  /* eslint-enable complexity */

  return useCallback(renderItem, [
    query,
    listType,
    navigation,
    options.horizontal,
    options.noSubtitle
  ]);
};
