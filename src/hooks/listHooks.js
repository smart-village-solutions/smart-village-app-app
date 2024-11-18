import { isArray } from 'lodash';
import React, { useCallback, useContext } from 'react';
import { View } from 'react-native';

import { SettingsContext } from '../SettingsProvider';
import { ConversationListItem, SectionHeader, VoucherListItem } from '../components';
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
 *          noOvertitle?: boolean;
 *          isIndexStartingAt1?: boolean
 *          noSubtitle?: boolean;
 *          listType?: boolean
 *          openWebScreen?: () => void;
 *          queryVariables?: object
 *          refetch?: () => void
 *        }} options
 * @returns renderItem function
 */
export const useRenderItem = (query, navigation, options = {}) => {
  const { globalSettings, listTypesSettings } = useContext(SettingsContext);
  const { settings = {} } = globalSettings;
  const { listsWithoutArrows = false } = settings;

  const listType = getListType(query, listTypesSettings);

  let renderItem;

  switch (options.listType || listType) {
    case LIST_TYPES.CARD_LIST: {
      renderItem = ({ item, index }) => {
        if (query === QUERY_TYPES.EVENT_RECORDS && typeof item === 'string') {
          return <EventSectionHeader {...{ item, navigation, options, query }} />;
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
              navigation={navigation}
              horizontal={options.horizontal}
              noOvertitle={options.noOvertitle}
              index={index}
              item={item}
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
              noOvertitle={options.noOvertitle}
              rightImage
              withCard
            />
          );
        }
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
          return (
            <View
              style={{
                marginLeft: target == 'StickyHeader' ? 0 : -normalize(16),
                marginRight: target == 'StickyHeader' ? 0 : -normalize(16)
              }}
            >
              <EventSectionHeader {...{ item, options, query }} />
            </View>
          );
        }

        // `SectionHeader` list item for `Noticeboard`
        if (query === QUERY_TYPES.GENERIC_ITEMS && !!item.component) {
          return item.component;
        }

        return (
          <TextListItem
            item={item}
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
