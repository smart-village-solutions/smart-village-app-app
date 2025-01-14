import PropTypes from 'prop-types';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { NetworkContext } from '../../NetworkProvider';
import { SettingsContext } from '../../SettingsProvider';
import { colors, Icon, normalize } from '../../config';
import { addToStore, readFromStore } from '../../helpers';
import { useStaticContent, useVolunteerRefresh } from '../../hooks';
import { HtmlView } from '../HtmlView';
import { Image } from '../Image';
import { LoadingSpinner } from '../LoadingSpinner';
import { SafeAreaViewFlex } from '../SafeAreaViewFlex';
import { SectionHeader } from '../SectionHeader';
import { Wrapper } from '../Wrapper';

import { Service } from './Service';

const LIST_TYPE = 'listType';

export const LIST_TYPES = {
  grid: 'grid',
  list: 'list'
};

/* eslint-disable complexity */
export const ServiceTiles = ({
  hasDiagonalGradientBackground,
  html,
  image,
  isEditMode,
  listTypeProp,
  query,
  staticJsonName,
  title
}) => {
  const { globalSettings } = useContext(SettingsContext);
  const { sections = {} } = globalSettings;
  const { showListTypeButton = true } = sections;
  const { isConnected } = useContext(NetworkContext);
  const [refreshing, setRefreshing] = useState(false);
  const [listType, setListType] = useState(listTypeProp || LIST_TYPES.grid);

  const fetchListType = async () => {
    const storedListType = await readFromStore(LIST_TYPE + staticJsonName);

    if (storedListType && storedListType !== listType) {
      setListType(storedListType);
    }
  };

  const toggleListType = async () => {
    const newListType = listType === LIST_TYPES.grid ? LIST_TYPES.list : LIST_TYPES.grid;
    setListType(newListType);
    await addToStore(LIST_TYPE + staticJsonName, newListType);
  };

  useEffect(() => {
    fetchListType();
  }, [listType]);

  const { data, loading, refetch, error } = useStaticContent({
    refreshTimeKey: `publicJsonFile-${staticJsonName}`,
    name: staticJsonName,
    type: 'json'
  });

  const {
    data: htmlContent,
    loading: htmlLoading,
    refetch: htmlRefetch
  } = useStaticContent({
    refreshTimeKey: `publicJsonFile-${staticJsonName}Content`,
    name: `${staticJsonName}Content`,
    type: 'json'
  });

  const refresh = useCallback(async () => {
    setRefreshing(true);
    isConnected && (await refetch?.());
    isConnected && (await htmlRefetch?.());
    setRefreshing(false);
  }, [isConnected, refetch]);

  useVolunteerRefresh(refetch, query);

  if (loading || htmlLoading) {
    return <LoadingSpinner loading />;
  }

  const contentForAbove = html || htmlContent?.forAbove;
  const contentForBelow = htmlContent?.forBelow;

  // check if any item in the data array has an tile key
  const hasTile = data.some((item) => item.tile);

  return (
    <SafeAreaViewFlex>
      {isEditMode ? (
        <Service
          data={data}
          hasDiagonalGradientBackground={hasDiagonalGradientBackground}
          isEditMode
          listType={listType}
          staticJsonName={staticJsonName}
        />
      ) : (
        <>
          <SectionHeader title={title} />
          <ScrollView
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={refresh}
                colors={[colors.refreshControl]}
                tintColor={colors.refreshControl}
              />
            }
          >
            {!!image && (
              <Image source={{ uri: image }} containerStyle={styles.imageContainerStyle} />
            )}

            {!!contentForAbove && (
              <Wrapper>
                <HtmlView html={contentForAbove} />
              </Wrapper>
            )}

            <View style={styles.padding}>
              {showListTypeButton && !hasTile && (
                <TouchableOpacity onPress={toggleListType} style={{ alignSelf: 'flex-end' }}>
                  {listType === LIST_TYPES.grid ? <Icon.List /> : <Icon.Grid />}
                </TouchableOpacity>
              )}

              {!error && (
                <Service data={data} staticJsonName={staticJsonName} listType={listType} />
              )}
            </View>

            {!!contentForBelow && (
              <Wrapper>
                <HtmlView html={contentForBelow} />
              </Wrapper>
            )}
          </ScrollView>
        </>
      )}
    </SafeAreaViewFlex>
  );
};
/* eslint-enable complexity */

const styles = StyleSheet.create({
  imageContainerStyle: {
    alignSelf: 'center'
  },
  padding: {
    padding: normalize(14)
  }
});

ServiceTiles.propTypes = {
  hasDiagonalGradientBackground: PropTypes.bool,
  html: PropTypes.string,
  image: PropTypes.string,
  isEditMode: PropTypes.bool,
  listTypeProp: PropTypes.string,
  query: PropTypes.string,
  staticJsonName: PropTypes.string.isRequired,
  title: PropTypes.string
};
