import React, { useContext } from 'react';
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
          <TouchableOpacity onPress={undefined}>
            <RegularText lightest={hasDiagonalGradientBackground} center small underline>
              {texts.serviceTiles.edit}
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
