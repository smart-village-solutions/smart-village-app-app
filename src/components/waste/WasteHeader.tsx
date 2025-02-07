import React, { useContext } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { Icon, normalize, texts } from '../../config';
import { useStreetString } from '../../hooks';
import { SettingsContext } from '../../SettingsProvider';
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
  const { globalSettings } = useContext(SettingsContext);
  const { settings = {} } = globalSettings;
  const { wasteAddresses = {} } = settings;
  const { texts: wasteAddressesTexts = {} } = wasteAddresses;
  const wasteTexts = { ...texts.wasteCalendar, ...wasteAddressesTexts };
  const { getStreetString } = useStreetString();

  if (!locationData) return null;

  return (
    <Wrapper>
      <RegularText>{wasteTexts.myLocation}</RegularText>
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
