import React, { useContext, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { normalize, texts } from '../../config';
import { SettingsContext } from '../../SettingsProvider';
import { RegularText } from '../Text';
import { WrapperWrap } from '../Wrapper';

import { ServiceTile } from './ServiceTile';

export const Service = ({
  data,
  hasDiagonalGradientBackground,
  staticJsonName
}: {
  data: any;
  hasDiagonalGradientBackground?: boolean;
  staticJsonName: string;
}) => {
  const { globalSettings } = useContext(SettingsContext);
  const [isEditMode, setIsEditMode] = useState(false);

  return (
    <>
      <WrapperWrap spaceBetween>
        {data?.map((item: any, index: number) => (
          <ServiceTile
            key={index + (item.title || item.accessibilityLabel)}
            item={item}
            hasDiagonalGradientBackground={hasDiagonalGradientBackground}
          />
        ))}
      </WrapperWrap>
      {globalSettings?.settings?.personalizedTiles && (
        <View style={styles.paddingTop}>
          <TouchableOpacity onPress={() => setIsEditMode(!isEditMode)}>
            <RegularText lightest={hasDiagonalGradientBackground} center small underline>
              {isEditMode ? texts.serviceTiles.done : texts.serviceTiles.edit}
            </RegularText>
          </TouchableOpacity>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  paddingTop: {
    paddingTop: normalize(14)
  }
});
