import React, { useCallback } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { colors, normalize } from '../config';
import { BoldText } from './Text';

type Props = {
  setShowMap: (newValue: boolean) => void,
  showMap: boolean
}

export const MapSwitchHeader = ({ setShowMap, showMap }: Props) => {
  const onPressShowMap = useCallback(() => setShowMap(true), [setShowMap]);
  const onPressShowList = useCallback(() => setShowMap(false), [setShowMap]);

  return <View style={styles.container}>
    <TouchableOpacity onPress={onPressShowList} style={styles.button}>
      <View style={!showMap ? styles.textWrapperSelected : undefined}>
        <BoldText style={styles.text}>Listenansicht</BoldText>
      </View>
    </TouchableOpacity>
    <TouchableOpacity onPress={onPressShowMap} style={styles.button}>
      <View style={showMap ? styles.textWrapperSelected : undefined}>
        <BoldText style={styles.text}>Kartenansicht</BoldText>
      </View>
    </TouchableOpacity>
  </View>;
};

const styles = StyleSheet.create({
  button: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: normalize(8)

  },
  container: {
    flexDirection: 'row',
    justifyContent: 'center'
  },
  text: {
    fontSize: normalize(18),
    textAlign: 'center'
  },
  textWrapperSelected: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary
  }
});
