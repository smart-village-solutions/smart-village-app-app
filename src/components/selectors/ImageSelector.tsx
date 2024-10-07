import { ImagePickerAsset } from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { useMutation } from 'react-apollo';
import { Alert, StyleSheet, TouchableOpacity } from 'react-native';

import { colors, Icon, normalize, texts } from '../../config';
import { ConsulClient } from '../../ConsulClient';
import { jsonParser } from '../../helpers';
import { imageHeight, imageWidth } from '../../helpers/imageHelper';
import { onDeleteImage, onImageSelect } from '../../helpers/selectors';
import { useSelectImage } from '../../hooks';
import { DELETE_IMAGE } from '../../queries/consul';
import { Button } from '../Button';
import { Input } from '../form';
import { Image } from '../Image';
import { RegularText } from '../Text';
import { WrapperRow } from '../Wrapper';

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
export const ImageSelector = ({
  control,
  errorType,
  field,
  imageId,
  item
}: {
  control: any;
  errorType: string;
  field: any;
  imageId: string;
  item: any;
}) => {
  const { buttonTitle, infoText } = item;
  const { name, onChange, value } = field;

  const [infoAndErrorText, setInfoAndErrorText] = useState(JSON.parse(value));
  const [imagesAttributes, setImagesAttributes] = useState(JSON.parse(value));

  const [deleteImage] = useMutation(DELETE_IMAGE, {
    client: ConsulClient
  });

  const { selectImage } = useSelectImage({
    allowsEditing: false,
    aspect: [1, 1],
    exif: false
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
  };

  const imageDelete = async (index: number) => {
    await onDeleteImage({
      imageId,
      deleteImage,
      imagesAttributes,
      index,
      infoAndErrorText,
      setImagesAttributes,
      setInfoAndErrorText
    });
  };

  const values = jsonParser(value);

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
            <Image source={{ uri: values[0].uri }} style={styles.image} />

            <TouchableOpacity onPress={() => deleteImageAlert(() => imageDelete(0))}>
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
  }
});
