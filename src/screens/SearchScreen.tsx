import React, { useContext, useEffect, useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { SearchBar } from 'react-native-elements';

import { SafeAreaViewFlex } from '../components';
import { colors, device, Icon, texts } from '../config';
import { SettingsContext } from '../SettingsProvider';

export const SearchScreen = () => {
  const { globalSettings } = useContext(SettingsContext);
  const { settings = {} } = globalSettings;
  const { search: searchSettings = {} } = settings;
  const { texts: searchSettingsTexts = {} } = searchSettings;
  const searchTexts = { ...texts.search, ...searchSettingsTexts };
  const [search, setSearch] = useState('');
  const [showLoading, setShowLoading] = useState(false);
  const searchBarRef = useRef(null);

  useEffect(() => {
    setTimeout(() => {
      searchBarRef?.current?.focus();
    }, 500);
  }, [searchBarRef.current]);

  return (
    <SafeAreaViewFlex>
      <SearchBar
        cancelButtonProps={{
          accessibilityLabel: searchTexts.abort,
          color: colors.darkerPrimary
        }}
        cancelButtonTitle={searchTexts.abort}
        clearIcon={() => (
          <TouchableOpacity activeOpacity={1} onPress={() => searchBarRef?.current?.clear()}>
            <Icon.Close color={colors.darkerPrimary} />
          </TouchableOpacity>
        )}
        inputContainerStyle={styles.inputContainerStyle}
        onChangeText={setSearch}
        placeholder={searchTexts.placeholder}
        placeholderTextColor={colors.placeholder}
        platform={device.platform}
        ref={searchBarRef}
        searchIcon={<Icon.Search color={colors.darkerPrimary} />}
        showCancel
        showLoading={showLoading}
        value={search}
      />
      {/* The search results component will go here */}
    </SafeAreaViewFlex>
  );
};

const styles = StyleSheet.create({
  inputContainerStyle: {
    backgroundColor: colors.backgroundRgba
  }
});
