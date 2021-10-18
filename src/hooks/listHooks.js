/* eslint-disable react/prop-types */
import React, { useContext } from 'react';

import { consts } from '../config';
import { SettingsContext } from '../SettingsProvider';
import { CardListItem } from '../components/CardListItem';
import { TextListItem } from '../components/TextListItem';

const { LIST_TYPES } = consts;

export const useRenderItem = (query, navigation, noSubtitle) => {
  const { listTypesSettings } = useContext(SettingsContext);

  const listType = listTypesSettings[query];

  switch (listType) {
    case LIST_TYPES.CARD_LIST: {
      return ({ item }) => <CardListItem navigation={navigation} horizontal={false} item={item} />;
    }
    case LIST_TYPES.IMAGE_TEXT_LIST: {
      return ({ item }) => <TextListItem {...{ navigation, item, noSubtitle, leftImage: true }} />;
    }
    default: {
      return ({ item }) => <TextListItem {...{ navigation, item, noSubtitle }} />;
    }
  }
};
