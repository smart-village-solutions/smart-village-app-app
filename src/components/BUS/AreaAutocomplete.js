import PropTypes from 'prop-types';
import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import Autocomplete from 'react-native-autocomplete-input';
import { SearchBar } from 'react-native-elements';

import { colors, consts, normalize, texts } from '../../config';
import { useBusAreas } from '../../hooks';
import { Label } from '../Label';
import { RegularText } from '../Text';
import { WrapperHorizontal, WrapperRow } from '../Wrapper';

const MIN_SEARCH_LENGTH = 3;
const { a11yLabel } = consts;

const getSearchStateText = ({ hasNoResults, isSearching, isUnavailable }) => {
  if (isUnavailable) return texts.bus.locationFilter.error;
  if (isSearching) return texts.bus.locationFilter.loading;
  if (hasNoResults) return texts.bus.locationFilter.noResults;

  return '';
};

const shouldShowResetText = ({ hasDifferentSelection, hasInitialAreaName, isEmpty }) =>
  hasInitialAreaName && (isEmpty || hasDifferentSelection);

const getHelperText = ({
  hasBusConfig,
  hasDifferentSelection,
  initialAreaName,
  isFocused,
  isError,
  isFetching,
  isLoading,
  normalizedAreasLength,
  shouldSearch,
  trimmedInputLength
}) => {
  const hasInitialAreaName = !!initialAreaName;
  const isEmpty = trimmedInputLength === 0;
  const isBelowMinLength = trimmedInputLength > 0 && trimmedInputLength < MIN_SEARCH_LENGTH;
  const isUnavailable = !hasBusConfig || isError;
  const isSearching = isLoading || isFetching;
  const hasNoResults = !normalizedAreasLength;
  const showResetText = shouldShowResetText({
    hasDifferentSelection,
    hasInitialAreaName,
    isEmpty
  });

  if (showResetText && (isEmpty || (hasDifferentSelection && !isFocused))) {
    return texts.bus.locationFilter.resetTo(initialAreaName);
  }

  if (isBelowMinLength) {
    return texts.bus.locationFilter.minSearchLength;
  }

  if (shouldSearch) {
    return getSearchStateText({ hasNoResults, isSearching, isUnavailable });
  }

  if (showResetText) {
    return texts.bus.locationFilter.resetTo(initialAreaName);
  }

  return '';
};

export const AreaAutocomplete = memo(
  ({ areaId, areaName, initialAreaId, initialAreaName, onSelectArea }) => {
    const [inputValue, setInputValue] = useState(areaName || '');
    const [isFocused, setIsFocused] = useState(false);
    const [searchBarRenderKey, setSearchBarRenderKey] = useState(0);
    const previousSelection = useRef({ areaId, areaName });
    const trimmedInputValue = inputValue.trim();
    const shouldSearch = trimmedInputValue.length >= MIN_SEARCH_LENGTH;
    const {
      data = [],
      hasBusConfig,
      isError,
      isFetching,
      isLoading
    } = useBusAreas(inputValue, isFocused && shouldSearch);
    const areas = useMemo(
      () =>
        data.map((item) => ({
          ...item,
          label: item.displayName || item.name || item.nameShort
        })),
      [data]
    );

    useEffect(() => {
      const hasSelectionChanged =
        previousSelection.current.areaId !== areaId ||
        previousSelection.current.areaName !== areaName;

      if (!hasSelectionChanged) return;

      previousSelection.current = { areaId, areaName };

      const timeoutId = setTimeout(() => {
        setInputValue(areaName || '');
      }, 0);

      return () => clearTimeout(timeoutId);
    }, [areaId, areaName]);

    const shouldHideResults = !isFocused || !shouldSearch;
    const hasDifferentSelection = !!initialAreaId && `${areaId}` !== `${initialAreaId}`;
    const canResetToInitialArea = !!initialAreaId && !!initialAreaName;
    const helperText = useMemo(
      () =>
        getHelperText({
          hasBusConfig,
          hasDifferentSelection,
          initialAreaName,
          isFocused,
          isError,
          isFetching,
          isLoading,
          normalizedAreasLength: areas.length,
          shouldSearch,
          trimmedInputLength: trimmedInputValue.length
        }),
      [
        hasBusConfig,
        hasDifferentSelection,
        initialAreaName,
        isFocused,
        isError,
        isFetching,
        isLoading,
        areas.length,
        shouldSearch,
        trimmedInputValue.length
      ]
    );

    const renderSuggestion = ({ item }) => (
      <TouchableOpacity
        accessibilityRole="button"
        key={item.id}
        onPress={() => {
          setInputValue(item.label);
          setIsFocused(false);
          onSelectArea({ id: item.id, label: item.label });
        }}
        style={styles.suggestionItem}
      >
        <RegularText>{item.label}</RegularText>
      </TouchableOpacity>
    );

    return (
      <View>
        <WrapperHorizontal>
          <Label>{texts.bus.locationFilter.label}</Label>
        </WrapperHorizontal>
        <Autocomplete
          autoCorrect={false}
          containerStyle={styles.autoCompleteContainer}
          data={areas}
          disableFullscreenUI
          flatListProps={{
            keyboardShouldPersistTaps: 'handled',
            keyExtractor: (item, index) => `${item.id || item.label}-${index}`,
            renderItem: renderSuggestion,
            style: styles.autoCompleteList
          }}
          hideResults={shouldHideResults}
          inputContainerStyle={styles.autoCompleteInputContainer}
          listContainerStyle={styles.autoCompleteListContainer}
          onBlur={() => setIsFocused(false)}
          onChangeText={(text) => {
            setIsFocused(true);
            setInputValue(text);
          }}
          onFocus={() => setIsFocused(true)}
          renderTextInput={() => (
            <SearchBar
              key={searchBarRenderKey}
              clearIcon={{
                accessibilityLabel: `${texts.accessibilityLabels.searchInputIcons.delete} ${a11yLabel.button}`,
                color: colors.primary,
                size: normalize(24)
              }}
              containerStyle={styles.searchBarContainerStyle}
              inputContainerStyle={styles.searchBarInputContainerStyle}
              inputStyle={[
                styles.searchBarInputStyle,
                inputValue.length && styles.searchBarMarginLeft
              ]}
              leftIconContainerStyle={styles.searchBarLeftIconContainerStyle}
              lightTheme
              onBlur={() => setIsFocused(false)}
              onChangeText={(text) => {
                setIsFocused(true);
                setInputValue(text);
              }}
              onClearText={() => {
                setIsFocused(true);
                setInputValue('');
              }}
              onFocus={() => setIsFocused(true)}
              placeholder={texts.bus.locationFilter.searchPlaceholder}
              placeholderTextColor={colors.darkText}
              rightIconContainerStyle={styles.searchBarRightIconContainerStyle}
              searchIcon={
                inputValue.length
                  ? null
                  : {
                      accessibilityLabel: `${texts.accessibilityLabels.searchInputIcons.search} ${a11yLabel.button}`,
                      color: colors.primary,
                      size: normalize(28)
                    }
              }
              value={inputValue}
            />
          )}
        />
        {!!helperText && (
          <View style={styles.helperTextWrapper}>
            <TouchableOpacity
              accessibilityRole={canResetToInitialArea ? 'button' : undefined}
              disabled={!canResetToInitialArea}
              onPress={() => {
                if (!canResetToInitialArea) return;

                setInputValue(initialAreaName || '');
                setIsFocused(false);
                setSearchBarRenderKey((currentKey) => currentKey + 1);
                onSelectArea({ id: initialAreaId, label: initialAreaName || '' });
              }}
            >
              <WrapperRow>
                <RegularText small style={styles.helperText}>
                  {helperText}
                </RegularText>
              </WrapperRow>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  autoCompleteContainer: {
    width: '100%'
  },
  autoCompleteInputContainer: {
    backgroundColor: colors.transparent,
    borderBottomWidth: 0,
    borderTopWidth: 0,
    borderWidth: 0,
    minHeight: normalize(42)
  },
  autoCompleteListContainer: {
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { height: 5, width: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    width: '100%'
  },
  autoCompleteList: {
    paddingHorizontal: normalize(6),
    position: 'relative',
    ...Platform.select({
      ios: {
        borderWidth: 0
      },
      android: {
        borderColor: colors.gray20,
        borderRadius: 0,
        borderWidth: normalize(1),
        maxHeight: normalize(300)
      }
    })
  },
  helperText: {
    color: colors.darkText,
    opacity: 0.7
  },
  helperTextWrapper: {
    marginTop: normalize(8),
    paddingHorizontal: normalize(16)
  },
  searchBarContainerStyle: {
    backgroundColor: colors.backgroundRgba,
    borderColor: colors.borderRgba,
    borderWidth: StyleSheet.hairlineWidth,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderRgba,
    borderTopColor: colors.borderRgba,
    padding: normalize(6)
  },
  searchBarInputContainerStyle: {
    backgroundColor: colors.transparent
  },
  searchBarInputStyle: {
    backgroundColor: colors.transparent,
    color: colors.darkText,
    fontFamily: 'regular',
    fontSize: normalize(16)
  },
  searchBarLeftIconContainerStyle: {
    backgroundColor: colors.transparent,
    marginLeft: normalize(6)
  },
  searchBarMarginLeft: {
    marginLeft: normalize(8)
  },
  searchBarRightIconContainerStyle: {
    backgroundColor: colors.transparent
  },
  suggestionItem: {
    backgroundColor: colors.surface,
    minHeight: normalize(48),
    justifyContent: 'center',
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(10)
  }
});

AreaAutocomplete.displayName = 'AreaAutocomplete';
AreaAutocomplete.propTypes = {
  areaId: PropTypes.string.isRequired,
  areaName: PropTypes.string,
  initialAreaId: PropTypes.string,
  initialAreaName: PropTypes.string,
  onSelectArea: PropTypes.func.isRequired
};
