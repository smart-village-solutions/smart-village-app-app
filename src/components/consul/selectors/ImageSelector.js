import * as FileSystem from 'expo-file-system';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { colors, consts, Icon, normalize, texts } from '../../../config';
import { formatSize, imageErrorMessageHelper, imageHeight, imageWidth } from '../../../helpers';
import { useSelectImage } from '../../../hooks';
import { Button } from '../../Button';
import { Input } from '../../form';
import { Image } from '../../Image';
import { RegularText } from '../../Text';
import { WrapperRow } from '../../Wrapper';

const { IMAGE_TYPE_REGEX } = consts;

export const ImageSelector = ({ control, field, item }) => {
  const [infoAndErrorText, setInfoAndErrorText] = useState({});

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

            <TouchableOpacity
              onPress={() => {
                onChange('');
                setInfoAndErrorText({});
              }}
            >
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
            const errorMessage = await imageErrorMessageHelper(uri);
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
  selectImage: PropTypes.func
};

const styles = StyleSheet.create({
  image: {
    height: imageHeight(imageWidth() * 0.6),
    width: imageWidth() * 0.6
  }
});
