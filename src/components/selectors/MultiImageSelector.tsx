import { ImagePickerAsset } from 'expo-image-picker';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Divider } from 'react-native-elements';
import { useMutation } from 'react-query';

import { colors, consts, Icon, normalize, texts } from '../../config';
import { jsonParser, volunteerApiV1Url } from '../../helpers';
import { onDeleteImage, onImageSelect } from '../../helpers/selectors';
import {
  useCaptureImage,
  useLastKnownPosition,
  usePosition,
  useReverseGeocode,
  useSelectImage,
  useSystemPermission
} from '../../hooks';
import { deleteFile } from '../../queries/volunteer';
import { Button } from '../Button';
import { Input } from '../form';
import { Image } from '../Image';
import { LoadingSpinner } from '../LoadingSpinner';
import { Modal } from '../Modal';
import { BoldText, RegularText } from '../Text';
import { WrapperRow, WrapperVertical } from '../Wrapper';

const { IMAGE_FROM, IMAGE_SELECTOR_TYPES } = consts;

type TValue = {
  exif: any;
  imageName: string;
  mimeType: string;
  size: number;
  uri: string;
};

const deleteImageAlert = (onPress: () => void) =>
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
export const MultiImageSelector = ({
  authToken,
  configuration,
  control,
  coordinateCheck,
  errorType,
  field,
  imageId,
  item,
  selectorType
}: {
  authToken: string | null;
  configuration: any;
  control: any;
  coordinateCheck: any;
  errorType: string;
  field: any;
  imageId?: number | string;
  item: any;
  selectorType: string;
}) => {
  const reverseGeocode = useReverseGeocode();
  const systemPermission = useSystemPermission();

  const { position } = usePosition(systemPermission?.status !== Location.PermissionStatus.GRANTED);
  const { position: lastKnownPosition } = useLastKnownPosition(
    systemPermission?.status !== Location.PermissionStatus.GRANTED
  );

  const { buttonTitle, infoText } = item;
  const { name, onChange, value } = field;
  const { maxCount, maxFileSize } = configuration?.limitation || {};

  const [infoAndErrorText, setInfoAndErrorText] = useState([]);
  const [imagesAttributes, setImagesAttributes] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

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

  const { mutateAsync: mutateAsyncDeleteFile } = useMutation(deleteFile);

  const values = jsonParser(value);

  useEffect(() => {
    if (!!values?.length && !hasInitialized) {
      setImagesAttributes(values);
      setInfoAndErrorText(values);
      setHasInitialized(true);
    }
  }, [values]);

  useEffect(() => {
    onChange(JSON.stringify(imagesAttributes));
  }, [imagesAttributes]);

  const imageSelect = async (
    imageFunction: () => Promise<ImagePickerAsset | undefined>,
    from?: string
  ) => {
    setLoading(true);
    await onImageSelect({
      configuration,
      coordinateCheck,
      errorType,
      from,
      imageFunction,
      imagesAttributes,
      infoAndErrorText,
      lastKnownPosition,
      maxFileSize,
      position,
      reverseGeocode,
      selectorType,
      setImagesAttributes,
      setInfoAndErrorText
    });

    setIsModalVisible(false);
    setLoading(false);
  };

  const imageDelete = async (index: number) => {
    await onDeleteImage({
      coordinateCheck,
      deleteImage:
        selectorType === IMAGE_SELECTOR_TYPES.VOLUNTEER ? mutateAsyncDeleteFile : undefined,
      imageId,
      imagesAttributes,
      index,
      infoAndErrorText,
      isMultiImages: true,
      selectorType,
      setImagesAttributes,
      setInfoAndErrorText
    });
  };

  if (
    selectorType === IMAGE_SELECTOR_TYPES.SUE ||
    selectorType === IMAGE_SELECTOR_TYPES.NOTICEBOARD
  ) {
    return (
      <>
        <Input {...item} control={control} hidden name={name} value={values} />

        <Button
          disabled={!!maxCount && values?.length >= parseInt(maxCount)}
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
                  onPress={() => deleteImageAlert(() => imageDelete(index))}
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
          closeButton={
            <TouchableOpacity
              disabled={loading}
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
          isBackdropPress
          isVisible={isModalVisible}
          onModalVisible={() => setIsModalVisible(false)}
          overlayStyle={styles.overlay}
        >
          <WrapperVertical style={styles.noPaddingTop}>
            <BoldText>{texts.sue.report.addImage}</BoldText>
          </WrapperVertical>

          <WrapperVertical style={styles.noPaddingTop}>
            <Divider />
          </WrapperVertical>

          <WrapperVertical>
            {loading ? (
              <LoadingSpinner loading={loading} />
            ) : (
              <>
                <Button
                  disabled={loading}
                  icon={<Icon.Camera size={normalize(16)} strokeWidth={normalize(2)} />}
                  iconPosition="left"
                  invert
                  onPress={() => imageSelect(captureImage, IMAGE_FROM.CAMERA)}
                  title={texts.sue.report.alerts.imageSelectAlert.camera}
                />
                <Button
                  disabled={loading}
                  icon={<Icon.Albums size={normalize(16)} strokeWidth={normalize(2)} />}
                  iconPosition="left"
                  invert
                  onPress={() => imageSelect(selectImage)}
                  title={texts.sue.report.alerts.imageSelectAlert.gallery}
                />
              </>
            )}
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

      {selectorType !== IMAGE_SELECTOR_TYPES.VOLUNTEER && (
        <Button title={buttonTitle} invert onPress={() => imageSelect(selectImage)} />
      )}

      {values?.map((item: TValue, index: number) => {
        const imageSource = item.uri?.startsWith('file:///')
          ? { uri: item.uri }
          : {
              uri: `${volunteerApiV1Url}file/download/${item.id}`,
              headers: { Authorization: `Bearer ${authToken}` }
            };

        return (
          <View key={`image-${index}`} style={styles.volunteerContainer}>
            <View style={styles.volunteerUploadPreview}>
              {selectorType === IMAGE_SELECTOR_TYPES.VOLUNTEER && (
                <Image
                  borderRadius={normalize(4)}
                  childrenContainerStyle={styles.volunteerImage}
                  source={imageSource}
                />
              )}

              {(!!infoAndErrorText[index]?.infoText || !!values?.[index]?.file_name) && (
                <RegularText
                  numberOfLines={1}
                  small
                  style={[
                    styles.infoText,
                    selectorType === IMAGE_SELECTOR_TYPES.VOLUNTEER && styles.volunteerInfoText
                  ]}
                >
                  {infoAndErrorText?.[index]?.infoText || values?.[index]?.file_name}
                </RegularText>
              )}

              <TouchableOpacity onPress={() => deleteImageAlert(() => imageDelete(index))}>
                <Icon.Trash color={colors.darkText} size={normalize(16)} />
              </TouchableOpacity>
            </View>

            {!!infoAndErrorText[index]?.errorText && (
              <RegularText smallest error>
                {infoAndErrorText[index].errorText}
              </RegularText>
            )}
          </View>
        );
      })}

      {selectorType === IMAGE_SELECTOR_TYPES.VOLUNTEER && (
        <Button title={buttonTitle} invert onPress={() => imageSelect(selectImage)} />
      )}
    </>
  );
};
/* eslint-enable complexity */

const styles = StyleSheet.create({
  infoText: {
    width: '90%'
  },
  noPaddingTop: {
    paddingTop: 0
  },
  overlay: {
    backgroundColor: colors.surface,
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
  volunteerImage: {
    height: normalize(55),
    width: normalize(55)
  },
  volunteerInfoText: {
    width: '65%'
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
