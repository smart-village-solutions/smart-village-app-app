import * as FileSystem from 'expo-file-system';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { colors, consts, Icon, normalize, texts } from '../../../config';
import { formatSize, imageHeight, imageWidth } from '../../../helpers';
import { useSelectImage } from '../../../hooks';
import { Button } from '../../Button';
import { Input } from '../../form';
import { Image } from '../../Image';
import { RegularText } from '../../Text';
import { WrapperRow } from '../../Wrapper';

const { IMAGE_TYPE_REGEX } = consts;

export const ImageSelector = ({ control, field, item }) => {
  const [errorMessage, setErrorMessage] = useState('');
  const [imageInfoText, setImageInfoText] = useState('');

  const { buttonTitle, infoText } = item;
  const { name, onChange, value } = field;

  const { selectImage } = useSelectImage(
    undefined, // onChange
    false, // allowsEditing,
    undefined, // aspect,
    undefined // quality
  );

  return (
    <>
      <Input
        {...item}
        control={control}
        errorMessage={errorMessage}
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

            <TouchableOpacity
              onPress={() => {
                onChange('');
                setErrorMessage('');
                setImageInfoText('');
              }}
            >
              <Icon.Trash color={colors.error} size={normalize(16)} />
            </TouchableOpacity>
          </WrapperRow>
          {!!imageInfoText && <RegularText smallest>{imageInfoText}</RegularText>}
        </>
      ) : (
        <Button
          title={buttonTitle}
          invert
          onPress={async () => {
            const { uri, type } = await selectImage();
            const { size } = await FileSystem.getInfoAsync(uri);
            const imageType = IMAGE_TYPE_REGEX.exec(uri)[1];

            const errorMessage = imageErrorMessageGenerator({
              size,
              imageType
            });

            setErrorMessage(texts.consul.startNew[errorMessage]);
            setImageInfoText(`(${type}/${imageType}, ${formatSize(size)})`);
            onChange(uri);
          }}
        />
      )}
    </>
  );
};

const imageErrorMessageGenerator = ({ size, imageType }) => {
  const isJPG = imageType === 'jpg' || imageType === 'jpeg';
  const isGreater1MB = size > 1048576;

  const errorMessage =
    !isJPG && isGreater1MB
      ? 'choose-image-content-type-image/png-does-not-match-any-of-accepted-content-types-jpg,-choose-image-must-be-in-between-0-bytes-and-1-mb'
      : !isJPG
      ? 'choose-image-content-type-image/png-does-not-match-any-of-accepted-content-types-jpg'
      : isGreater1MB
      ? 'choose-image-must-be-in-between-0-bytes-and-1-mb'
      : '';

  return errorMessage;
};

ImageSelector.propTypes = {
  control: PropTypes.object,
  field: PropTypes.object,
  item: PropTypes.object,
  selectImage: PropTypes.func
};

const styles = StyleSheet.create({
  image: {
    height: imageHeight(imageWidth() * 0.6),
    width: imageWidth() * 0.6
  }
});
