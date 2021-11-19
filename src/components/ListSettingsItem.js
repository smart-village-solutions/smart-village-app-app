import PropTypes from 'prop-types';
import React, { useCallback, useContext, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Collapsible from 'react-native-collapsible';
import { Divider, ListItem } from 'react-native-elements';

import { colors, consts, Icon, normalize, texts } from '../config';
import { storageHelper } from '../helpers';
import { SettingsContext } from '../SettingsProvider';

import { BoldText } from './Text';
import { Touchable } from './Touchable';
import { Wrapper, WrapperRow, WrapperVertical } from './Wrapper';

const { LIST_TYPES } = consts;

const RADIO_BUTTON_SIZE = normalize(16);

// TODO: snack bar / toast als nutzerinfo
export const ListSettingsItem = ({ item }) => {
  const { title, queryType } = item;
  const [isCollapsed, setIsCollapsed] = useState(true);
  const { listTypesSettings, setListTypesSettings } = useContext(SettingsContext);
  const listTypeForQuery = listTypesSettings[queryType];

  useContext(SettingsContext);

  const onPressTitle = useCallback(() => setIsCollapsed((value) => !value), []);
  const getOnPressListType = (listType) => () =>
    setListTypesSettings((previousListTypes) => {
      const updatedListTypesSettings = {
        ...previousListTypes,
        [queryType]: listType
      };

      storageHelper.setListTypesSettings(updatedListTypesSettings);

      return updatedListTypesSettings;
    });

  return (
    <View>
      <Touchable onPress={onPressTitle}>
        <WrapperVertical>
          <Wrapper>
            <WrapperRow spaceBetween>
              <BoldText>{title}</BoldText>
              {isCollapsed ? <Icon.ArrowDown /> : <Icon.ArrowUp />}
            </WrapperRow>
          </Wrapper>
        </WrapperVertical>
      </Touchable>
      <Divider style={styles.divider} />
      <Collapsible collapsed={isCollapsed}>
        {Object.values(LIST_TYPES).map((listType) => (
          <ListItem
            key={listType}
            bottomDivider
            onPress={getOnPressListType(listType)}
            rightIcon={() =>
              listType === listTypeForQuery ? (
                <Icon.RadioButtonFilled size={RADIO_BUTTON_SIZE} />
              ) : (
                <Icon.RadioButtonEmpty color={colors.darkText} size={RADIO_BUTTON_SIZE} />
              )
            }
            title={texts.settingsTitles.listLayouts[listType]}
          />
        ))}
      </Collapsible>
    </View>
  );
};

const styles = StyleSheet.create({
  divider: {
    backgroundColor: colors.placeholder
  }
});

ListSettingsItem.propTypes = {
  item: PropTypes.object.isRequired
};
