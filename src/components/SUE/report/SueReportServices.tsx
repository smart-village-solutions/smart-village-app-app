import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useQuery } from 'react-query';

import { colors, consts, device, normalize } from '../../../config';
import { imageHeight } from '../../../helpers';
import { QUERY_TYPES, getQuery } from '../../../queries';
import { TService } from '../../../screens';
import { LoadingSpinner } from '../../LoadingSpinner';
import { BoldText } from '../../Text';

const ServiceTile = memo(({ item, selected, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
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
));

const { a11yLabel } = consts;

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

  const refresh = useCallback(async () => {
    await refetch();
    setLoading(false);
  }, [refetch]);

  const memoizedData = useMemo(() => data || [], [data]);

  if (isLoading || loading) {
    return <LoadingSpinner loading />;
  }

  return (
    <View style={styles.container}>
      {memoizedData.map((item, index) => {
        const selected = service?.serviceCode === item.serviceCode;
        return (
          <ServiceTile
            key={index}
            item={item}
            selected={selected}
            accessibilityLabel={`${item.serviceName} ${a11yLabel.button}`}
            onPress={() => setService(item)}
          />
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
