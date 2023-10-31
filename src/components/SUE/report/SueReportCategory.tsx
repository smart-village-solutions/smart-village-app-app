import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { colors, normalize } from '../../../config';
import { useSueData } from '../../../hooks';
import { QUERY_TYPES } from '../../../queries';
import { BoldText } from '../../Text';

export const SueReportCategory = ({
  serviceCode,
  setServiceCode
}: {
  serviceCode: string;
  setServiceCode: any;
}) => {
  const { data } = useSueData({ query: QUERY_TYPES.SUE.SERVICES });

  return (
    <View style={styles.container}>
      {data?.map((item, index) => {
        const selected = serviceCode === item.serviceCode;

        return (
          <TouchableOpacity
            key={index}
            onPress={() => setServiceCode(item.serviceCode)}
            style={[
              styles.tile,
              {
                backgroundColor: selected ? colors.primary + '10' : colors.transparent,
                borderColor: selected ? colors.primary : colors.gray40
              }
            ]}
          >
            <BoldText center>{item.serviceName}</BoldText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around'
  },
  tile: {
    alignItems: 'center',
    borderRadius: normalize(8),
    borderWidth: normalize(1),
    height: normalize(114),
    justifyContent: 'center',
    marginVertical: 5,
    width: normalize(176)
  }
});
