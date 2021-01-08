import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { ListItem, Overlay } from 'react-native-elements';

import { colors, normalize } from '../config';
import { storageHelper } from '../helpers';
import { Checkbox } from './Checkbox';
import { Icon } from './Icon';
import { BoldText, RegularText } from './Text';
import { Touchable } from './Touchable';

const DataProviderCheckboxes = () => {
  const [ignoredDataProvider, setIgnoredDataProvider] = useState([]);

  useEffect(() => {
    const readIgnoredDataProvider = async () =>
      setIgnoredDataProvider((await storageHelper.ignoredDataProvider()) || []);

    readIgnoredDataProvider();
  }, []);

  useEffect(() => {
    storageHelper.setIgnoredDataProvider(ignoredDataProvider);
  }, [ignoredDataProvider]);

  // TODO: get all really existing data provider from server
  const allDataProvider = ['Sony', 'Philips', 'Motorola'].sort();

  return allDataProvider.map((dataProvider) => {
    const checked = !ignoredDataProvider.includes(dataProvider);

    return (
      <Checkbox
        key={dataProvider}
        title={dataProvider}
        onPress={() => {
          let onPress = (prevIgnoredDataProvider) =>
            prevIgnoredDataProvider.filter((item) => item !== dataProvider);

          if (checked) {
            onPress = (prevIgnoredDataProvider) => [...prevIgnoredDataProvider, dataProvider];
          }

          setIgnoredDataProvider(onPress);
        }}
        checked={checked}
      />
    );
  });
};

// TODO: snack bar / toast als nutzerinfo
export const SettingsDataProvider = ({ item }) => {
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);

  const { title } = item;

  return (
    <>
      <ListItem
        title={title && <BoldText>{title}</BoldText>}
        topDivider
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
        onBackdropPress={() => {
          setIsOverlayVisible(false);
          // TODO: save to a provider or something to update alle lists with data provider selection
        }}
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
          <DataProviderCheckboxes />
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

SettingsDataProvider.propTypes = {
  item: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  section: PropTypes.object.isRequired,
  orientation: PropTypes.string.isRequired,
  dimensions: PropTypes.object.isRequired
};
