import PropTypes from 'prop-types';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import Collapsible from 'react-native-collapsible';
import { Divider, ListItem } from 'react-native-elements';

import { consts, device, Icon, normalize, texts } from '../config';
import { storageHelper } from '../helpers';
import { useTheme } from '../hooks/useTheme';
import { SettingsContext } from '../SettingsProvider';

import { BoldText, RegularText } from './Text';
import { Touchable } from './Touchable';
import { Wrapper, WrapperRow } from './Wrapper';

const { a11yLabel, LIST_TYPES } = consts;

const RADIO_BUTTON_SIZE = normalize(16);

// TODO: snack bar / toast als nutzerinfo
export const ListSettingsItem = ({ item }) => {
  const { title, queryType } = item;
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const { listTypesSettings, setListTypesSettings } = useContext(SettingsContext);
  const listTypeForQuery = listTypesSettings[queryType];
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
    <>
      <Touchable
        accessibilityLabel={`(${item.title}) ${a11yLabel.dropDownMenu} (${
          isCollapsed
            ? texts.accessibilityLabels.dropDownMenu.closed
            : texts.accessibilityLabels.dropDownMenu.open
        })`}
        onPress={onPressTitle}
      >
        <Wrapper style={styles.wrapper}>
          <WrapperRow spaceBetween>
            <BoldText>{title}</BoldText>
            {isCollapsed ? (
              <Icon.ArrowDown color={colors.text} />
            ) : (
              <Icon.ArrowUp color={colors.text} />
            )}
          </WrapperRow>
        </Wrapper>
      </Touchable>
      <Divider style={styles.divider} />
      <Collapsible collapsed={isCollapsed}>
        {Object.values(LIST_TYPES).map((listType) => {
          const activeTabAccessibilityLabel =
            listType === listTypeForQuery
              ? texts.accessibilityLabels.menuItem.active
              : texts.accessibilityLabels.menuItem.inactive;

          return (
            <ListItem
              accessibilityLabel={`(${texts.settingsTitles.listLayouts[listType]}) ${a11yLabel.button} ${activeTabAccessibilityLabel}`}
              key={listType}
              bottomDivider
              containerStyle={styles.container}
              onPress={getOnPressListType(listType)}
              delayPressIn={0}
              Component={Touchable}
            >
              <ListItem.Content>
                <RegularText small>{texts.settingsTitles.listLayouts[listType]}</RegularText>
              </ListItem.Content>

              {listType === listTypeForQuery ? (
                <Icon.RadioButtonFilled color={colors.primary} size={RADIO_BUTTON_SIZE} />
              ) : (
                <Icon.RadioButtonEmpty color={colors.text} size={RADIO_BUTTON_SIZE} />
              )}
            </ListItem>
          );
        })}
      </Collapsible>
    </>
  );
};

/* eslint-disable react-native/no-unused-styles */
const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.transparent,
      paddingRight: normalize(18),
      paddingVertical: normalize(12)
    },
    divider: {
      backgroundColor: colors.placeholder
    },
    wrapper: {
      paddingBottom: device.platform === 'ios' ? normalize(16) : normalize(14),
      paddingTop: device.platform === 'ios' ? normalize(16) : normalize(18)
    }
  });
/* eslint-enable react-native/no-unused-styles */

ListSettingsItem.propTypes = {
  item: PropTypes.object.isRequired
};
