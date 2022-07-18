import * as FileSystem from 'expo-file-system';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList } from 'react-native';

import { consts, device, texts } from '../../config';
import { deleteAllData, downloadAllData, formatSize } from '../../helpers';
import { usePullToRefetch } from '../../hooks';
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
      { text: texts.settingsTitles.arListLayouts.cancel, style: 'cancel' },
      {
        text: texts.settingsTitles.arListLayouts.downloadAlertButtonText,
        onPress: downloadAll
      }
    ]
  );

const deleteAllDataAlert = (deleteAll) =>
  Alert.alert(
    texts.settingsTitles.arListLayouts.alertTitle,
    texts.settingsTitles.arListLayouts.allDeleteAlertMessage,
    [
      { text: texts.settingsTitles.arListLayouts.cancel, style: 'cancel' },
      {
        text: texts.settingsTitles.arListLayouts.deleteAlertButtonText,
        onPress: deleteAll,
        style: 'destructive'
      }
    ]
  );

const renderItem = ({ data, index, item, navigation, setData, refetch, showOnDetailPage }) => (
  <ARObjectListItem
    data={data}
    index={index}
    item={item}
    navigation={navigation}
    setData={setData}
    refetch={refetch}
    showOnDetailPage={showOnDetailPage}
  />
);

export const ARObjectList = ({
  data,
  setData,
  isLoading,
  navigation,
  refetch,
  showDeleteAllButton,
  showDownloadAllButton,
  showFreeSpace,
  showOnDetailPage,
  showTitle
}) => {
  const [freeSize, setFreeSize] = useState(0);

  useEffect(() => {
    checkFreeStorage();
  }, [data]);

  const checkFreeStorage = async () => {
    const storage = await FileSystem.getFreeDiskStorageAsync();
    setFreeSize(formatSize(storage));
  };

  const downloadAll = async () => {
    await downloadAllData({ data, setData });
  };

  const deleteAll = async () => {
    await deleteAllData({ data, setData });
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
            setData,
            index,
            item,
            navigation,
            refetch,
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
  data: PropTypes.array,
  setData: PropTypes.func,
  isLoading: PropTypes.bool,
  refetch: PropTypes.func,
  navigation: PropTypes.object,
  showDeleteAllButton: PropTypes.bool,
  showDownloadAllButton: PropTypes.bool,
  showFreeSpace: PropTypes.bool,
  showOnDetailPage: PropTypes.bool,
  showTitle: PropTypes.bool
};
