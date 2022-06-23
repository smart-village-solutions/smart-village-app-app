import * as FileSystem from 'expo-file-system';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList } from 'react-native';

import { texts } from '../../config';
import { checkDownloadedData, deleteAllData, downloadAllData, formatSize } from '../../helpers';
import { usePullToRefetch, useStaticContent } from '../../hooks';
import { ARDownloadListSettingsItem } from '../ARDownloadListSettingsItem';
import { Button } from '../Button';
import { LoadingSpinner } from '../LoadingSpinner';
import { SectionHeader } from '../SectionHeader';
import { RegularText } from '../Text';
import { Touchable } from '../Touchable';
import { Wrapper } from '../Wrapper';

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

const renderItem = ({ data, index, item, setData }) => (
  <ARDownloadListSettingsItem item={item} index={index} data={data} setData={setData} />
);

export const ARDownloadListSettings = () => {
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
    const { newDownloadedData } = await checkDownloadedData({ downloadableData: data });
    setData(newDownloadedData);
    setIsLoading(false);
  };

  const checkFreeStorage = async () => {
    const storage = await FileSystem.getFreeDiskStorageAsync();
    setFreeSize(formatSize(storage));
  };

  const downloadAll = async () => {
    downloadAllData({ downloadableData: data, setDownloadableData: setData });
  };

  const deleteAll = async () => {
    deleteAllData({ downloadableData: data, setDownloadableData: setData });
  };

  const RefreshControl = usePullToRefetch(refetch);

  if (isLoading || !data?.length) return <LoadingSpinner loading />;

  return (
    <>
      <SectionHeader title={texts.settingsTitles.arListLayouts.arListTitle} />

      <FlatList
        refreshControl={RefreshControl}
        data={data}
        renderItem={({ item, index }) => renderItem({ data, index, item, setData })}
        keyExtractor={(item) => item.id}
      />

      <Wrapper>
        <Button
          invert
          title={texts.settingsTitles.arListLayouts.allDownloadButtonTitle}
          onPress={() => downloadAllDataAlert(downloadAll)}
        />

        <Touchable onPress={() => deleteAllDataAlert(deleteAll)}>
          <RegularText small primary underline center>
            {texts.settingsTitles.arListLayouts.allDeleteButtonTitle}
          </RegularText>
        </Touchable>

        <RegularText smallest center>
          {`${texts.settingsTitles.arListLayouts.freeMemoryPlace}${freeSize}`}
        </RegularText>
      </Wrapper>
    </>
  );
};
