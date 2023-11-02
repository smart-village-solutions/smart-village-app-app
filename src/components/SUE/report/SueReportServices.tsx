import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useQuery } from 'react-query';

import { colors, normalize } from '../../../config';
import { QUERY_TYPES, getQuery } from '../../../queries';
import { BoldText } from '../../Text';

export const SueReportServices = ({
  serviceCode,
  setServiceCode
}: {
  serviceCode: string;
  setServiceCode: any;
}) => {
  const { data, isError } = useQuery([QUERY_TYPES.SUE.SERVICES], () =>
    getQuery(QUERY_TYPES.SUE.SERVICES)()
  );

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
