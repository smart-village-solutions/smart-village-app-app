/* eslint-disable react/prop-types */
import { isArray } from 'lodash';
import React, { useCallback, useContext } from 'react';

import { SettingsContext } from '../SettingsProvider';
import { CardListItem } from '../components/CardListItem';
import { TextListItem } from '../components/TextListItem';
import { VolunteerApplicantListItem } from '../components/volunteer/VolunteerApplicantListItem';
import { VolunteerConversationListItem } from '../components/volunteer/VolunteerConversationListItem';
import { VolunteerPostListItem } from '../components/volunteer/VolunteerPostListItem';
import { consts } from '../config';
import { QUERY_TYPES } from '../queries';

const { LIST_TYPES } = consts;

const getListType = (query, listTypesSettings) => {
  switch (query) {
    case QUERY_TYPES.POINTS_OF_INTEREST:
    case QUERY_TYPES.TOURS:
      return listTypesSettings[QUERY_TYPES.POINTS_OF_INTEREST_AND_TOURS];
    default:
      return listTypesSettings[query];
  }
};

/**
 * this hook creates a render item function wrapped in a useCallback depending on the given options,
 * as well as on the listTypesSettings of the SettingsContext
 * @param {string} query
 * @param {any} navigation
 * @param {{
 *          horizontal?: boolean;
 *          noSubtitle?: boolean;
 *          openWebScreen?: () => void;
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

  switch (listType) {
    case LIST_TYPES.CARD_LIST: {
      renderItem = ({ item }) => (
        <CardListItem navigation={navigation} horizontal={options.horizontal} item={item} />
      );
      break;
    }
    case LIST_TYPES.IMAGE_TEXT_LIST: {
      renderItem = ({ item, index, section }) => (
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
      break;
    }
    case LIST_TYPES.CARD_TEXT_LIST: {
      renderItem = ({ item, index, section }) => {
        if (index === 0) {
          return (
            <CardListItem navigation={navigation} horizontal={options.horizontal} item={item} />
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
              rightImage
              withCard
            />
          );
        }
      };
      break;
    }
    default: {
      renderItem = ({ item, index, section }) => {
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

        return (
          <TextListItem
            item={{
              ...item,
              bottomDivider: isArray(section?.data) ? section.data.length - 1 !== index : undefined
            }}
            {...{ navigation, noSubtitle: options.noSubtitle, listsWithoutArrows }}
          />
        );
      };

      break;
    }
  }

  return useCallback(renderItem, [
    query,
    listType,
    navigation,
    options.horizontal,
    options.noSubtitle
  ]);
};
