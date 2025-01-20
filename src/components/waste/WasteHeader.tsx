import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { Icon, normalize } from '../../config';
import { useStreetString } from '../../hooks';
import { BoldText, RegularText } from '../Text';
import { Wrapper, WrapperRow } from '../Wrapper';

type WasteHeaderProps = {
  locationData?: {
    city?: string;
    street?: string;
    zip?: string;
  };
  resetSelectedStreetId: () => void;
};

export const WasteHeader = ({ locationData, resetSelectedStreetId }: WasteHeaderProps) => {
  const { getStreetString } = useStreetString();

  if (!locationData) return null;

  return (
    <Wrapper>
      <RegularText>Meine Straße:</RegularText>
      <WrapperRow>
        <BoldText>{getStreetString(locationData)}</BoldText>
        <TouchableOpacity onPress={resetSelectedStreetId}>
          <Icon.Pen size={normalize(20)} style={styles.icon} />
        </TouchableOpacity>
      </WrapperRow>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  icon: {
    paddingHorizontal: normalize(10)
  }
});
