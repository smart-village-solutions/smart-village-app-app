import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useMutation } from 'react-apollo';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';

import { colors, consts, Icon, normalize, texts } from '../../../config';
import { ConsulClient } from '../../../ConsulClient';
import { deleteArrayItem, errorTextGenerator, jsonParser } from '../../../helpers';
import { imageHeight, imageWidth } from '../../../helpers/imageHelper';
import { useSelectImage } from '../../../hooks';
import { DELETE_IMAGE } from '../../../queries/consul';
import { calendarDeleteFile } from '../../../queries/volunteer';
import { Button } from '../../Button';
import { Input } from '../../form';
import { Image } from '../../Image';
import { RegularText } from '../../Text';
import { WrapperRow } from '../../Wrapper';

const { IMAGE_TYPE_REGEX, URL_REGEX } = consts;

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

export const ImageSelector = ({
  control,
  errorType,
  field,
  imageId,
  isDeletable = true,
  isMultiImages,
  item
}) => {
  const { buttonTitle, infoText } = item;
  const { name, onChange, value } = field;

  const [infoAndErrorText, setInfoAndErrorText] = useState(JSON.parse(value));
  const [imagesAttributes, setImagesAttributes] = useState(JSON.parse(value));

  const [deleteImage] = useMutation(DELETE_IMAGE, {
    client: ConsulClient
  });

  const { selectImage } = useSelectImage(
    undefined, // onChange
    false, // allowsEditing,
    undefined, // aspect,
    undefined // quality
  );

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

  const imageSelect = async () => {
    const { uri, type } = await selectImage();

    /* used to specify the mimeType when uploading to the server */
    const imageType = IMAGE_TYPE_REGEX.exec(uri)[1];
    const mimeType = `${type}/${imageType}`;

    errorTextGenerator({ errorType, infoAndErrorText, mimeType, setInfoAndErrorText, uri });

    setImagesAttributes([...imagesAttributes, { uri, mimeType }]);
  };

  const values = jsonParser(value);

  if (isMultiImages) {
    return (
      <>
        <Input {...item} control={control} hidden name={name} value={JSON.stringify(value)} />
        <RegularText smallest placeholder>
          {infoText}
        </RegularText>

        <Button title={buttonTitle} invert onPress={imageSelect} />

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

            {isDeletable && (
              <TouchableOpacity onPress={() => deleteImageAlert(() => onDeleteImage(0))}>
                <Icon.Trash color={colors.error} size={normalize(16)} />
              </TouchableOpacity>
            )}
          </WrapperRow>

          {!!infoAndErrorText[0]?.infoText && (
            <RegularText smallest>{infoAndErrorText[0].infoText}</RegularText>
          )}
        </>
      ) : (
        <Button title={buttonTitle} invert onPress={imageSelect} />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  image: {
    height: imageHeight(imageWidth() * 0.6),
    width: imageWidth() * 0.6
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
  control: PropTypes.object,
  errorType: PropTypes.string,
  field: PropTypes.object,
  imageId: PropTypes.string,
  isDeletable: PropTypes.bool,
  isMultiImages: PropTypes.bool,
  item: PropTypes.object
};
