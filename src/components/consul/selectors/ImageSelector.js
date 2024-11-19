import * as FileSystem from 'expo-file-system';
import * as Location from 'expo-location';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useMutation } from 'react-apollo';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Divider } from 'react-native-elements';

import { colors, consts, Icon, normalize, texts } from '../../../config';
import { ConsulClient } from '../../../ConsulClient';
import { deleteArrayItem, errorTextGenerator, jsonParser } from '../../../helpers';
import { imageHeight, imageWidth } from '../../../helpers/imageHelper';
import {
  useCaptureImage,
  useLastKnownPosition,
  usePosition,
  useReverseGeocode,
  useSelectImage,
  useSystemPermission
} from '../../../hooks';
import { DELETE_IMAGE } from '../../../queries/consul';
import { calendarDeleteFile } from '../../../queries/volunteer';
import { Button } from '../../Button';
import { Input } from '../../form';
import { Image } from '../../Image';
import { Modal } from '../../Modal';
import { BoldText, RegularText } from '../../Text';
import { WrapperRow, WrapperVertical } from '../../Wrapper';

const { IMAGE_SELECTOR_TYPES, IMAGE_TYPE_REGEX, URL_REGEX } = consts;

const IMAGE_FROM = {
  CAMERA: 'Camera',
  GALLERY: 'Gallery'
};

const deleteImageAlert = (onPress) =>
  Alert.alert(
    texts.consul.startNew.deleteAttributesAlertTitle,
    texts.consul.startNew.imageDeleteAlertBody,
    [
      {
        text: texts.consul.abort,
        style: 'cancel'
      },
      {
        text: texts.consul.startNew.deleteAttributesButtonText,
        onPress,
        style: 'destructive'
      }
    ]
  );

/* eslint-disable complexity */
export const ImageSelector = ({
  configuration,
  control,
  coordinateCheck,
  errorType,
  field,
  imageId,
  isMultiImages,
  item,
  selectorType
}) => {
  const reverseGeocode = useReverseGeocode();
  const systemPermission = useSystemPermission();

  const { position } = usePosition(systemPermission?.status !== Location.PermissionStatus.GRANTED);
  const { position: lastKnownPosition } = useLastKnownPosition(
    systemPermission?.status !== Location.PermissionStatus.GRANTED
  );

  const { buttonTitle, infoText } = item;
  const { name, onChange, value } = field;
  const { maxCount, maxFileSize } = configuration?.limitation;

  const [infoAndErrorText, setInfoAndErrorText] = useState(JSON.parse(value));
  const [imagesAttributes, setImagesAttributes] = useState(JSON.parse(value));
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [deleteImage] = useMutation(DELETE_IMAGE, {
    client: ConsulClient
  });

  const { selectImage } = useSelectImage({
    allowsEditing: false,
    aspect: selectorType === IMAGE_SELECTOR_TYPES.SUE ? undefined : [1, 1],
    exif: selectorType === IMAGE_SELECTOR_TYPES.SUE
  });

  const { captureImage } = useCaptureImage({
    allowsEditing: false,
    aspect: selectorType === IMAGE_SELECTOR_TYPES.SUE ? undefined : [1, 1],
    exif: selectorType === IMAGE_SELECTOR_TYPES.SUE,
    saveImage: selectorType === IMAGE_SELECTOR_TYPES.SUE
  });

  useEffect(() => {
    onChange(JSON.stringify(imagesAttributes));
  }, [imagesAttributes]);

  const onDeleteImage = async (index) => {
    if (imageId) {
      try {
        await deleteImage({ variables: { id: imageId } });
      } catch (err) {
        console.error(err);
      }
    }

    if (selectorType === IMAGE_SELECTOR_TYPES.SUE) {
      const { GPSLatitude, GPSLongitude } = imagesAttributes?.[index]?.exif || {};
      const { selectedPosition, setValue = () => {} } = coordinateCheck || {};

      if (
        selectedPosition?.latitude === GPSLatitude &&
        selectedPosition?.longitude === GPSLongitude
      ) {
        coordinateCheck.setSelectedPosition(undefined);
        coordinateCheck.setUpdateRegionFromImage(false);

        setValue('city', '');
        setValue('houseNumber', '');
        setValue('street', '');
        setValue('postalCode', '');
      }
    }

    if (isMultiImages) {
      const isURL = URL_REGEX.test(imagesAttributes[index].uri);

      if (isURL) {
        try {
          await calendarDeleteFile(imagesAttributes[index].fileId, imagesAttributes[index].entryId);
        } catch (error) {
          console.error(error);
        }
      }

      setImagesAttributes(deleteArrayItem(imagesAttributes, index));
      setInfoAndErrorText(deleteArrayItem(infoAndErrorText, index));
      return;
    }

    setImagesAttributes(deleteArrayItem(imagesAttributes, index));
    setInfoAndErrorText(deleteArrayItem(infoAndErrorText, index));
  };

  const imageSelect = async (imageFunction, from = IMAGE_FROM.GALLERY) => {
    const { uri, type, exif } = await imageFunction();

    setIsModalVisible(!isModalVisible);

    const { GPSLatitude, GPSLongitude } = exif || {};
    const { size } = await FileSystem.getInfoAsync(uri);

    let location = { latitude: undefined, longitude: undefined };

    if (from === IMAGE_FROM.GALLERY) {
      location = {
        latitude: GPSLatitude,
        longitude: GPSLongitude
      };
    } else if (from === IMAGE_FROM.CAMERA) {
      location = {
        latitude: position?.coords?.latitude || lastKnownPosition?.coords?.latitude,
        longitude: position?.coords?.longitude || lastKnownPosition?.coords?.longitude
      };
    }

    const { areaServiceData = {}, errorMessage = '', setValue = () => {} } = coordinateCheck || {};

    /* used to specify the mimeType when uploading to the server */
    const imageType = IMAGE_TYPE_REGEX.exec(uri)[1];
    const mimeType = `${type}/${imageType}`;
    const uriSplitForImageName = uri.split('/');
    const imageName = uriSplitForImageName[uriSplitForImageName.length - 1];

    if (selectorType === IMAGE_SELECTOR_TYPES.SUE) {
      const extension = mimeType.split('/')[1];

      if (!configuration.limitation.allowedAttachmentTypes.value.includes(extension)) {
        setIsModalVisible(!isModalVisible);
        return Alert.alert(texts.sue.report.alerts.hint, texts.sue.report.alerts.imageType);
      }

      if (!!location.latitude && !!location.longitude) {
        try {
          await reverseGeocode({
            areaServiceData,
            errorMessage,
            position: location,
            setValue
          });

          coordinateCheck.setSelectedPosition(location);
          coordinateCheck.setUpdateRegionFromImage(true);
          coordinateCheck.setShowCoordinatesFromImageAlert(false);
        } catch (error) {
          console.error(error);
        }
      }
    }

    errorTextGenerator({
      errorType,
      infoAndErrorText,
      maxFileSize,
      mimeType,
      setInfoAndErrorText,
      uri
    });

    setImagesAttributes([...imagesAttributes, { uri, mimeType, imageName, size, exif }]);
    setIsModalVisible(!isModalVisible);
  };

  const values = jsonParser(value);

  if (isMultiImages) {
    if (
      selectorType === IMAGE_SELECTOR_TYPES.SUE ||
      selectorType === IMAGE_SELECTOR_TYPES.NOTICEBOARD
    ) {
      return (
        <>
          <Input {...item} control={control} hidden name={name} value={JSON.parse(value)} />

          <Button
            disabled={maxCount && values?.length >= parseInt(maxCount)}
            icon={<Icon.Camera size={normalize(16)} strokeWidth={normalize(2)} />}
            iconPosition="left"
            invert
            onPress={() => setIsModalVisible(!isModalVisible)}
            title={buttonTitle}
          />

          {!!infoText && (
            <RegularText small style={styles.sueInfoText}>
              {infoText}
            </RegularText>
          )}

          {values?.map(
            (item, index) =>
              !!infoAndErrorText[index]?.errorText && (
                <RegularText smallest error>
                  {infoAndErrorText[index].errorText}
                </RegularText>
              )
          )}

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <WrapperRow>
              {values?.map((item, index) => (
                <View key={`image-${index}`} style={{ marginRight: normalize(10) }}>
                  <TouchableOpacity
                    style={styles.sueDeleteImageButton}
                    onPress={() => deleteImageAlert(() => onDeleteImage(index))}
                  >
                    <Icon.Close color={colors.lightestText} size={normalize(16)} />
                  </TouchableOpacity>

                  <Image
                    source={{ uri: item.uri }}
                    childrenContainerStyle={styles.sueImage}
                    borderRadius={normalize(4)}
                  />
                </View>
              ))}
            </WrapperRow>
          </ScrollView>

          <Modal
            isBackdropPress
            isVisible={isModalVisible}
            onModalVisible={() => setIsModalVisible(false)}
            closeButton={
              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
                style={styles.overlayCloseButton}
              >
                <>
                  <BoldText small style={styles.overlayCloseButtonText}>
                    {texts.sue.report.alerts.close}
                  </BoldText>
                  <Icon.Close size={normalize(16)} color={colors.darkText} />
                </>
              </TouchableOpacity>
            }
            overlayStyle={styles.overlay}
          >
            <WrapperVertical style={styles.noPaddingTop}>
              <BoldText>{texts.sue.report.addImage}</BoldText>
            </WrapperVertical>

            <WrapperVertical style={styles.noPaddingTop}>
              <Divider />
            </WrapperVertical>

            <WrapperVertical>
              <Button
                icon={<Icon.Camera size={normalize(16)} strokeWidth={normalize(2)} />}
                iconPosition="left"
                invert
                onPress={() => imageSelect(captureImage, IMAGE_FROM.CAMERA)}
                title={texts.sue.report.alerts.imageSelectAlert.camera}
              />
              <Button
                icon={<Icon.Albums size={normalize(16)} strokeWidth={normalize(2)} />}
                iconPosition="left"
                invert
                onPress={() => imageSelect(selectImage)}
                title={texts.sue.report.alerts.imageSelectAlert.gallery}
              />
            </WrapperVertical>
          </Modal>
        </>
      );
    }

    return (
      <>
        <Input {...item} control={control} hidden name={name} value={JSON.stringify(value)} />
        <RegularText smallest placeholder>
          {infoText}
        </RegularText>

        <Button title={buttonTitle} invert onPress={() => imageSelect(selectImage)} />

        {values?.map((item, index) => (
          <View key={`image-${index}`} style={styles.volunteerContainer}>
            <View style={styles.volunteerUploadPreview}>
              {!!infoAndErrorText[index]?.infoText && (
                <RegularText style={styles.volunteerInfoText} numberOfLines={1} small>
                  {infoAndErrorText[index].infoText}
                </RegularText>
              )}

              <TouchableOpacity onPress={() => deleteImageAlert(() => onDeleteImage(index))}>
                <Icon.Trash color={colors.darkText} size={normalize(16)} />
              </TouchableOpacity>
            </View>

            {!!infoAndErrorText[index]?.errorText && (
              <RegularText smallest error>
                {infoAndErrorText[index].errorText}
              </RegularText>
            )}
          </View>
        ))}
      </>
    );
  }

  return (
    <>
      <Input
        {...item}
        control={control}
        errorMessage={infoAndErrorText?.[0]?.errorText}
        hidden
        name={name}
        value={JSON.parse(value)}
      />
      <RegularText smallest placeholder>
        {infoText}
      </RegularText>

      {values.length ? (
        <>
          <WrapperRow center spaceBetween>
            <Image source={{ uri: values[0].uri }} childrenContainerStyle={styles.image} />

            <TouchableOpacity onPress={() => deleteImageAlert(() => onDeleteImage(0))}>
              <Icon.Trash color={colors.error} size={normalize(16)} />
            </TouchableOpacity>
          </WrapperRow>

          {!!infoAndErrorText[0]?.infoText && (
            <RegularText smallest>{infoAndErrorText[0].infoText}</RegularText>
          )}
        </>
      ) : (
        <Button title={buttonTitle} invert onPress={() => imageSelect(selectImage)} />
      )}
    </>
  );
};
/* eslint-enable complexity */

const styles = StyleSheet.create({
  image: {
    height: imageHeight(imageWidth() * 0.6),
    width: imageWidth() * 0.6
  },
  noPaddingTop: {
    paddingTop: 0
  },
  overlay: {
    bottom: 0,
    paddingBottom: normalize(56),
    paddingHorizontal: normalize(16),
    paddingTop: normalize(24),
    position: 'absolute',
    width: '100%'
  },
  overlayCloseButton: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center'
  },
  overlayCloseButtonText: {
    paddingRight: normalize(10),
    paddingTop: normalize(3)
  },
  sueDeleteImageButton: {
    alignItems: 'center',
    backgroundColor: colors.placeholder,
    borderRadius: normalize(11),
    height: normalize(22),
    justifyContent: 'center',
    left: normalize(10),
    position: 'absolute',
    top: normalize(10),
    width: normalize(22),
    zIndex: 5
  },
  sueImage: {
    height: normalize(55),
    width: normalize(88)
  },
  sueInfoText: {
    marginTop: normalize(-7),
    marginBottom: normalize(5)
  },
  volunteerContainer: {
    marginBottom: normalize(8)
  },
  volunteerInfoText: {
    width: '90%'
  },
  volunteerUploadPreview: {
    alignItems: 'center',
    backgroundColor: colors.gray20,
    borderRadius: normalize(4),
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: normalize(20),
    paddingVertical: normalize(14)
  }
});

ImageSelector.propTypes = {
  configuration: PropTypes.object,
  control: PropTypes.object,
  coordinateCheck: PropTypes.object,
  errorType: PropTypes.string,
  field: PropTypes.object,
  imageId: PropTypes.string,
  isMultiImages: PropTypes.bool,
  item: PropTypes.object,
  selectorType: PropTypes.string
};
