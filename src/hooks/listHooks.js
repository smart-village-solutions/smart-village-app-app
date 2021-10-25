/* eslint-disable react/prop-types */
import React, { useCallback, useContext } from 'react';
import { isArray } from 'lodash';

import { consts } from '../config';
import { SettingsContext } from '../SettingsProvider';
import { CardListItem } from '../components/CardListItem';
import { TextListItem } from '../components/TextListItem';
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
 * @param {{ horizontal?: boolean; noSubtitle?: boolean; }} options
 * @returns renderItem function
 */
export const useRenderItem = (query, navigation, options = {}) => {
  const { listTypesSettings } = useContext(SettingsContext);

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
            bottomDivider: isArray(section?.data) ? section.data.length - 1 !== index : undefined
          }}
          {...{ navigation, noSubtitle: options.noSubtitle, leftImage: true }}
        />
      );
      break;
    }
    default: {
      renderItem = ({ item, index, section }) => (
        <TextListItem
          item={{
            ...item,
            bottomDivider: isArray(section?.data) ? section.data.length - 1 !== index : undefined
          }}
          {...{ navigation, noSubtitle: options.noSubtitle }}
        />
      );

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
