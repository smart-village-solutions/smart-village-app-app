import * as FileSystem from 'expo-file-system';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useMutation } from 'react-apollo';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';

import { colors, consts, Icon, normalize, texts } from '../../../config';
import { ConsulClient } from '../../../ConsulClient';
import {
  deleteArrayItem,
  formatSize,
  imageErrorMessageGenerator,
  imageHeight,
  imageWidth,
  jsonParser
} from '../../../helpers';
import { useSelectImage } from '../../../hooks';
import { DELETE_IMAGE } from '../../../queries/consul';
import { Button } from '../../Button';
import { Input } from '../../form';
import { Image } from '../../Image';
import { RegularText } from '../../Text';
import { WrapperRow } from '../../Wrapper';

const { IMAGE_TYPE_REGEX } = consts;

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

export const ImageSelector = ({ control, field, imageId, isVolunteer, item }) => {
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
    if (isVolunteer) {
      setImagesAttributes(deleteArrayItem(imagesAttributes, index));
      setInfoAndErrorText(deleteArrayItem(infoAndErrorText, index));
      return;
    }

    if (imageId) {
      try {
        await deleteImage({ variables: { id: imageId } });
      } catch (err) {
        console.error(err);
      }
    }

    onChange('');
    setInfoAndErrorText({});
  };

  const imageSelect = async () => {
    const { uri, type } = await selectImage();
    const { size } = await FileSystem.getInfoAsync(uri);

    /* the server does not support files more than 10MB in size. */
    const volunteerErrorText = size > 10485760 && texts.volunteer.imageGreater10MBError;
    const consulErrorText = await imageErrorMessageGenerator(uri);

    /* used to specify the mimeType when uploading to the server */
    const imageType = IMAGE_TYPE_REGEX.exec(uri)[1];

    /* variable to find the name of the image */
    const uriSplitForImageName = uri.split('/');
    const imageName = uriSplitForImageName[uriSplitForImageName.length - 1];

    if (isVolunteer) {
      setInfoAndErrorText([
        ...infoAndErrorText,
        {
          errorText: volunteerErrorText,
          infoText: `${imageName}`
        }
      ]);

      setImagesAttributes([...imagesAttributes, { uri, mimeType: `${type}/${imageType}` }]);
    } else {
      setInfoAndErrorText({
        errorText: texts.consul.startNew[consulErrorText],
        infoText: `(${type}/${imageType}, ${formatSize(size)})`
      });

      onChange(uri);
    }
  };

  if (isVolunteer) {
    const values = jsonParser(value);

    if (!values.length) return null;

    return (
      <>
        <Input {...item} control={control} hidden name={name} value={JSON.stringify(value)} />
        <RegularText smallest placeholder>
          {infoText}
        </RegularText>

        <Button title={buttonTitle} invert onPress={imageSelect} />

        {values?.map((item, index) => (
          <View key={index} style={styles.volunteerContainer}>
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
        errorMessage={infoAndErrorText?.errorText}
        hidden
        validate
        name={name}
        value={value}
      />
      <RegularText smallest placeholder>
        {infoText}
      </RegularText>

      {value ? (
        <>
          <WrapperRow center spaceBetween>
            <Image source={{ uri: value }} style={styles.image} />

            <TouchableOpacity onPress={() => deleteImageAlert(onDeleteImage)}>
              <Icon.Trash color={colors.error} size={normalize(16)} />
            </TouchableOpacity>
          </WrapperRow>

          {!!infoAndErrorText?.infoText && (
            <RegularText smallest>{infoAndErrorText.infoText}</RegularText>
          )}
        </>
      ) : (
        <Button title={buttonTitle} invert onPress={imageSelect} />
      )}
    </>
  );
};

ImageSelector.propTypes = {
  control: PropTypes.object,
  field: PropTypes.object,
  imageId: PropTypes.string,
  isVolunteer: PropTypes.bool,
  item: PropTypes.object
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
