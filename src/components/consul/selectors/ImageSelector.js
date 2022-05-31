import * as FileSystem from 'expo-file-system';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useMutation } from 'react-apollo';
import { Alert, StyleSheet, TouchableOpacity } from 'react-native';

import { colors, consts, Icon, normalize, texts } from '../../../config';
import { ConsulClient } from '../../../ConsulClient';
import { formatSize, imageErrorMessageGenerator, imageHeight, imageWidth } from '../../../helpers';
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

export const ImageSelector = ({ control, field, item, imageId }) => {
  const [infoAndErrorText, setInfoAndErrorText] = useState({});

  const { buttonTitle, infoText } = item;
  const { name, onChange, value } = field;

  const [deleteImage] = useMutation(DELETE_IMAGE, {
    client: ConsulClient
  });

  const { selectImage } = useSelectImage(
    undefined, // onChange
    false, // allowsEditing,
    undefined, // aspect,
    undefined // quality
  );

  const onDeleteImage = async () => {
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
        <Button
          title={buttonTitle}
          invert
          onPress={async () => {
            const { uri, type } = await selectImage();
            const { size } = await FileSystem.getInfoAsync(uri);
            const errorMessage = await imageErrorMessageGenerator(uri);
            const imageType = IMAGE_TYPE_REGEX.exec(uri)[1];

            setInfoAndErrorText({
              errorText: texts.consul.startNew[errorMessage],
              infoText: `(${type}/${imageType}, ${formatSize(size)})`
            });
            onChange(uri);
          }}
        />
      )}
    </>
  );
};

ImageSelector.propTypes = {
  control: PropTypes.object,
  field: PropTypes.object,
  item: PropTypes.object,
  imageId: PropTypes.string,
  selectImage: PropTypes.func
};

const styles = StyleSheet.create({
  image: {
    height: imageHeight(imageWidth() * 0.6),
    width: imageWidth() * 0.6
  }
});
