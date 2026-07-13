import React, { useContext, useState } from 'react';
import {
  NativeSyntheticEvent,
  StyleSheet,
  TextLayoutEventData,
  TouchableOpacity
} from 'react-native';

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
  onPress: () => void;
};

export const WasteHeader = ({ locationData, onPress }: WasteHeaderProps) => {
  const [editButtonPosition, setEditButtonPosition] = useState<{
    left: number;
    top: number;
  }>();
  const { globalSettings } = useContext(SettingsContext);
  const { settings = {} } = globalSettings;
  const { wasteAddresses = {} } = settings;
  const { texts: wasteAddressesTexts = {} } = wasteAddresses;
  const wasteTexts = { ...texts.wasteCalendar, ...wasteAddressesTexts };
  const { getStreetString } = useStreetString();

  const onAddressTextLayout = ({ nativeEvent }: NativeSyntheticEvent<TextLayoutEventData>) => {
    const lastLine = nativeEvent.lines[nativeEvent.lines.length - 1];

    if (!lastLine) return;

    setEditButtonPosition((currentPosition) => {
      const nextPosition = {
        left: lastLine.x + lastLine.width,
        top: lastLine.y
      };

      return currentPosition?.left === nextPosition.left && currentPosition.top === nextPosition.top
        ? currentPosition
        : nextPosition;
    });
  };

  if (!locationData) return null;

  return (
    <Wrapper>
      <RegularText>{wasteTexts.myLocation}:</RegularText>
      <WrapperRow style={styles.addressRow}>
        <BoldText style={styles.address} onTextLayout={onAddressTextLayout}>
          {getStreetString(locationData)}
        </BoldText>
        <TouchableOpacity
          onPress={onPress}
          style={[
            styles.editButton,
            editButtonPosition,
            !editButtonPosition && styles.hiddenEditButton
          ]}
        >
          <Icon.Pen size={normalize(20)} style={styles.icon} />
        </TouchableOpacity>
      </WrapperRow>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  address: {
    paddingRight: normalize(40),
    width: '100%'
  },
  addressRow: {
    position: 'relative'
  },
  editButton: {
    position: 'absolute'
  },
  hiddenEditButton: {
    opacity: 0
  },
  icon: {
    paddingHorizontal: normalize(10)
  }
});
