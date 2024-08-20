import { ImagePickerAsset } from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Divider } from 'react-native-elements';

import { colors, consts, Icon, normalize, texts } from '../../config';
import { jsonParser } from '../../helpers';
import { onDeleteImage, onImageSelect } from '../../helpers/selectors';
import { useCaptureImage, useSelectImage } from '../../hooks';
import { Button } from '../Button';
import { Input } from '../form';
import { Image } from '../Image';
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
  control,
  errorType,
  field,
  item,
  selectorType
}: {
  control: any;
  errorType: string;
  field: any;
  item: any;
  selectorType: string;
}) => {
  const { buttonTitle, infoText } = item;
  const { name, onChange, value } = field;

  const [infoAndErrorText, setInfoAndErrorText] = useState(JSON.parse(value));
  const [imagesAttributes, setImagesAttributes] = useState(JSON.parse(value));
  const [isModalVisible, setIsModalVisible] = useState(false);

  const { selectImage } = useSelectImage({
    allowsEditing: false,
    aspect: selectorType === IMAGE_SELECTOR_TYPES.NOTICEBOARD ? undefined : [1, 1],
    exif: false
  });

  const { captureImage } = useCaptureImage({
    allowsEditing: false,
    aspect: selectorType === IMAGE_SELECTOR_TYPES.NOTICEBOARD ? undefined : [1, 1],
    exif: false,
    saveImage: false // TODO: `IMAGE_SELECTOR_TYPES.SUE` after merge to master
  });

  useEffect(() => {
    onChange(JSON.stringify(imagesAttributes));
  }, [imagesAttributes]);

  const imageSelect = async (
    imageFunction: () => Promise<ImagePickerAsset | undefined>,
    from?: string
  ) => {
    await onImageSelect({
      errorType,
      from,
      imageFunction,
      imagesAttributes,
      infoAndErrorText,
      setImagesAttributes,
      setInfoAndErrorText
    });

    setIsModalVisible(!isModalVisible);
  };

  const imageDelete = async (index: number) => {
    await onDeleteImage({
      imagesAttributes,
      index,
      infoAndErrorText,
      isMultiImages: true,
      setImagesAttributes,
      setInfoAndErrorText
    });
  };

  const values = jsonParser(value);

  if (selectorType === IMAGE_SELECTOR_TYPES.NOTICEBOARD) {
    return (
      <>
        <Input {...item} control={control} hidden name={name} value={JSON.parse(value)} />

        <Button
          icon={<Icon.Camera size={normalize(16)} />}
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
          (item: TValue, index: number) =>
            !!infoAndErrorText[index]?.errorText && (
              <RegularText smallest error>
                {infoAndErrorText[index].errorText}
              </RegularText>
            )
        )}

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <WrapperRow>
            {values?.map((item: TValue, index: number) => (
              <View key={`image-${index}`} style={{ marginRight: normalize(10) }}>
                <TouchableOpacity
                  style={styles.sueDeleteImageButton}
                  onPress={() => deleteImageAlert(() => imageDelete(index))}
                >
                  <Icon.Close color={colors.lightestText} size={normalize(16)} />
                </TouchableOpacity>

                <Image
                  source={{ uri: item.uri }}
                  style={styles.sueImage}
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
          overlayStyle={styles.overlay}
        >
          <WrapperVertical style={styles.noPaddingTop}>
            <BoldText>{texts.noticeboard.addImages}</BoldText>
          </WrapperVertical>

          <WrapperVertical style={styles.noPaddingTop}>
            <Divider />
          </WrapperVertical>

          <WrapperVertical>
            <Button
              icon={<Icon.Camera size={normalize(16)} />}
              iconPosition="left"
              invert
              onPress={() => imageSelect(captureImage, IMAGE_FROM.CAMERA)}
              title={texts.noticeboard.takePhoto}
            />
            <Button
              icon={<Icon.Albums size={normalize(16)} />}
              iconPosition="left"
              invert
              onPress={() => imageSelect(selectImage)}
              title={texts.noticeboard.chooseFromGallery}
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

      {values?.map((item: TValue, index: number) => (
        <View key={`image-${index}`} style={styles.volunteerContainer}>
          <View style={styles.volunteerUploadPreview}>
            {!!infoAndErrorText[index]?.infoText && (
              <RegularText style={styles.volunteerInfoText} numberOfLines={1} small>
                {infoAndErrorText[index].infoText}
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
      ))}
    </>
  );
};
/* eslint-enable complexity */

const styles = StyleSheet.create({
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
