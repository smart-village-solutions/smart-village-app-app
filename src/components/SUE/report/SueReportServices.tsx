import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useQuery } from 'react-query';

import { colors, device, normalize } from '../../../config';
import { imageHeight } from '../../../helpers';
import { QUERY_TYPES, getQuery } from '../../../queries';
import { LoadingSpinner } from '../../LoadingSpinner';
import { BoldText, RegularText } from '../../Text';

export const SueReportServices = ({
  serviceCode,
  setServiceCode
}: {
  serviceCode: string;
  setServiceCode: any;
}) => {
  const [loading, setLoading] = useState(true);

  const { data, isLoading, refetch } = useQuery([QUERY_TYPES.SUE.SERVICES], () =>
    getQuery(QUERY_TYPES.SUE.SERVICES)()
  );

  useEffect(() => {
    refresh();
  }, []);

  const refresh = async () => {
    await refetch();
    setLoading(false);
  };

  if (isLoading || loading) {
    return <LoadingSpinner loading />;
  }

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

            {!!item.description && (
              <RegularText center smallest numberOfLines={3}>
                {item.description}
              </RegularText>
            )}
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
    justifyContent: 'space-around',
    padding: normalize(14)
  },
  tile: {
    alignItems: 'center',
    borderRadius: normalize(8),
    borderWidth: normalize(1),
    height: imageHeight(device.width / 2 - normalize(21), {
      HEIGHT: 114,
      WIDTH: 176
    }),
    justifyContent: 'center',
    marginVertical: normalize(5),
    padding: normalize(7),
    width: device.width / 2 - normalize(21)
  }
});
