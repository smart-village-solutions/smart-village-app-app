import * as FileSystem from 'expo-file-system';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList } from 'react-native';

import { consts, device, texts } from '../../config';
import { checkDownloadedData, deleteAllData, downloadAllData, formatSize } from '../../helpers';
import { usePullToRefetch, useStaticContent } from '../../hooks';
import { Button } from '../Button';
import { LoadingSpinner } from '../LoadingSpinner';
import { RegularText } from '../Text';
import { Title, TitleContainer, TitleShadow } from '../Title';
import { Touchable } from '../Touchable';
import { Wrapper } from '../Wrapper';

import { ARObjectListItem } from './ARObjectListItem';

const downloadAllDataAlert = (downloadAll) =>
  Alert.alert(
    texts.settingsTitles.arListLayouts.alertTitle,
    texts.settingsTitles.arListLayouts.allDownloadAlertMessage,
    [
      {
        text: texts.settingsTitles.arListLayouts.downloadAlertButtonText,
        onPress: downloadAll,
        style: 'default'
      },
      { text: texts.settingsTitles.arListLayouts.cancel, style: 'cancel' }
    ]
  );

const deleteAllDataAlert = (deleteAll) =>
  Alert.alert(
    texts.settingsTitles.arListLayouts.alertTitle,
    texts.settingsTitles.arListLayouts.allDeleteAlertMessage,
    [
      {
        text: texts.settingsTitles.arListLayouts.deleteAlertButtonText,
        onPress: deleteAll,
        style: 'destructive'
      },
      { text: texts.settingsTitles.arListLayouts.cancel, style: 'cancel' }
    ]
  );

const renderItem = ({ data, index, item, navigation, setData, showOnDetailPage }) => (
  <ARObjectListItem
    data={data}
    index={index}
    item={item}
    navigation={navigation}
    setData={setData}
    showOnDetailPage={showOnDetailPage}
  />
);

export const ARObjectList = ({
  navigation,
  showDeleteAllButton,
  showDownloadAllButton,
  showFreeSpace,
  showOnDetailPage,
  showTitle
}) => {
  const { data: staticData, loading, refetch } = useStaticContent({
    name: 'arDownloadableDataList',
    type: 'json'
  });

  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(loading);
  const [freeSize, setFreeSize] = useState(0);

  useEffect(() => {
    checkFreeStorage();
  }, [data]);

  useEffect(() => {
    setData(staticData);

    if (staticData?.length) {
      checkDownloadData({ data: staticData });
    }
  }, [staticData]);

  const checkDownloadData = async ({ data }) => {
    setIsLoading(true);
    const { checkedData } = await checkDownloadedData({ data });
    setData(checkedData);
    setIsLoading(false);
  };

  const checkFreeStorage = async () => {
    const storage = await FileSystem.getFreeDiskStorageAsync();
    setFreeSize(formatSize(storage));
  };

  const downloadAll = async () => {
    downloadAllData({ data, setData });
  };

  const deleteAll = async () => {
    deleteAllData({ data, setData });
  };

  const RefreshControl = usePullToRefetch(refetch);
  const a11yText = consts.a11yLabel;

  if (isLoading || !data?.length) return <LoadingSpinner loading />;

  return (
    <>
      {showTitle && (
        <>
          <TitleContainer>
            <Title
              accessibilityLabel={`(${texts.settingsTitles.arListLayouts.arListTitle}) ${a11yText.heading}`}
            >
              {texts.settingsTitles.arListLayouts.arListTitle}
            </Title>
          </TitleContainer>
          {device.platform === 'ios' && <TitleShadow />}
        </>
      )}

      <FlatList
        refreshControl={RefreshControl}
        data={data}
        renderItem={({ item, index }) =>
          renderItem({
            data,
            index,
            item,
            navigation,
            setData,
            showOnDetailPage
          })
        }
        keyExtractor={(item) => item.id}
      />

      <Wrapper>
        {showDownloadAllButton && (
          <Button
            invert
            title={texts.settingsTitles.arListLayouts.allDownloadButtonTitle}
            onPress={() => downloadAllDataAlert(downloadAll)}
          />
        )}

        {showDeleteAllButton && (
          <Touchable onPress={() => deleteAllDataAlert(deleteAll)}>
            <RegularText small primary underline center>
              {texts.settingsTitles.arListLayouts.allDeleteButtonTitle}
            </RegularText>
          </Touchable>
        )}

        {showFreeSpace && (
          <RegularText smallest center>
            {`${texts.settingsTitles.arListLayouts.freeMemoryPlace}${freeSize}`}
          </RegularText>
        )}
      </Wrapper>
    </>
  );
};

ARObjectList.propTypes = {
  navigation: PropTypes.object,
  showDeleteAllButton: PropTypes.bool,
  showDownloadAllButton: PropTypes.bool,
  showFreeSpace: PropTypes.bool,
  showOnDetailPage: PropTypes.bool,
  showTitle: PropTypes.bool
};
