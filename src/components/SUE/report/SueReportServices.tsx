import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useQuery } from 'react-query';

import { colors, device, normalize } from '../../../config';
import { imageHeight } from '../../../helpers';
import { QUERY_TYPES, getQuery } from '../../../queries';
import { TService } from '../../../screens';
import { LoadingSpinner } from '../../LoadingSpinner';
import { BoldText } from '../../Text';

export const SueReportServices = ({
  service,
  setService
}: {
  service?: TService;
  setService: any;
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
        const selected = service?.serviceCode === item.serviceCode;

        return (
          <TouchableOpacity
            key={index}
            onPress={() => setService(item)}
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
