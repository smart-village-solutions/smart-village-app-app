import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ListItem, Overlay } from 'react-native-elements';

import { colors, consts, normalize, texts } from '../config';
import { CardListItem } from './CardListItem';
import { Icon } from './Icon';
import { Radiobutton } from './Radiobutton';
import { BoldText, RegularText } from './Text';
import { TextListItem } from './TextListItem';
import { Touchable } from './Touchable';
import { WrapperHorizontal } from './Wrapper';

const { LIST_TYPES } = consts;

const previewListItem = {
  title: 'Überschrift',
  subtitle: 'Kategorie',
  picture: {
    url: 'https://via.placeholder.com/400.png/5f1919/fff?text=Bild'
  },
  topDivider: true
};

// TODO: snack bar / toast als nutzerinfo
export const SettingsListItem = ({ item, index, section, orientation, dimensions }) => {
  const { title, bottomDivider, topDivider, listSelection, onPress } = item;
  const Component = {
    [LIST_TYPES.TEXT_LIST]: TextListItem,
    [LIST_TYPES.IMAGE_TEXT_LIST]: TextListItem,
    [LIST_TYPES.CARD_LIST]: CardListItem
  }[listSelection];

  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const [selectedListType, setSelectedListType] = useState(listSelection);

  return (
    <>
      <ListItem
        title={
          title && (
            <View>
              <BoldText>{title}</BoldText>
              <RegularText>{texts.settingsTitles.listLayouts[listSelection]}:</RegularText>
              <RegularText small></RegularText>
              <WrapperHorizontal>
                <Component
                  item={previewListItem}
                  leftImage={listSelection === LIST_TYPES.IMAGE_TEXT_LIST}
                  horizontal
                  orientation={orientation}
                  dimensions={dimensions}
                />
              </WrapperHorizontal>
            </View>
          )
        }
        bottomDivider={
          // do not show a bottomDivider after last entry
          bottomDivider !== undefined || index < section.data.length - 1
        }
        topDivider={topDivider ?? false}
        containerStyle={{
          backgroundColor: colors.transparent,
          paddingVertical: normalize(12)
        }}
        rightIcon={<Icon name="md-create" size={22} style={styles.rightContentContainer} />}
        onPress={() => setIsOverlayVisible(true)}
        delayPressIn={0}
        Component={Touchable}
        accessibilityLabel={`${title} (Taste)`}
      />
      <Overlay
        isVisible={isOverlayVisible}
        onBackdropPress={() => setIsOverlayVisible(false)}
        windowBackgroundColor={colors.overlayRgba}
        overlayStyle={styles.overlay}
        width="auto"
        height="auto"
        borderRadius={0}
        supportedOrientations={['portrait', 'landscape']}
      >
        <>
          <BoldText>{title}</BoldText>
          <RegularText small></RegularText>
          {Object.values(LIST_TYPES).map((listType) => (
            <Radiobutton
              key={listType}
              title={texts.settingsTitles.listLayouts[listType]}
              onPress={() => {
                if (listType !== selectedListType) {
                  setSelectedListType(listType);
                  // call the onPress callback for that setting list item if present
                  onPress && onPress(listType);
                }
                setIsOverlayVisible(false);
              }}
              selected={listType === selectedListType}
            />
          ))}
        </>
      </Overlay>
    </>
  );
};

const styles = StyleSheet.create({
  rightContentContainer: {
    alignSelf: 'flex-start'
  },
  overlay: {
    padding: normalize(30)
  }
});

SettingsListItem.propTypes = {
  item: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  section: PropTypes.object.isRequired,
  orientation: PropTypes.string.isRequired,
  dimensions: PropTypes.object.isRequired
};
