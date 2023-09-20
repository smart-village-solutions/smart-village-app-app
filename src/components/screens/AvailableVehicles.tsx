import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

import { normalize, texts } from '../../config';
import { SectionHeader } from '../SectionHeader';
import { CategoryText, RegularText } from '../Text';
import { Wrapper, WrapperRow } from '../Wrapper';

type StationProps = {
  freeBikeStatusUrl: string;
  id: string;
  isVirtualStation: string;
  regionId: string;
  shortName: string;
};

type AvailableVehiclesProps = {
  bikes: {
    bike_id: string;
    is_disabled: boolean;
    is_reserved: boolean;
    lat: number;
    lon: number;
    pricing_plan_id: string;
    rental_uris: {
      android: string;
      ios: string;
      web: string;
    };
    station_id: string;
    vehicle_type_id: string;
  }[];
  is_installed: boolean;
  is_renting: boolean;
  is_returning: boolean;
  last_reported: Date;
  num_bikes_available: number;
  num_docks_available: number;
  station_id: string;
};

export const AvailableVehicles = ({
  availableVehicles,
  categoryName
}: {
  availableVehicles: StationProps;
  categoryName?: string;
}) => {
  const [availableVehiclesData, setAvailableVehiclesData] = useState<AvailableVehiclesProps>();

  useEffect(() => {
    const fetchData = async () => {
      const options = {
        method: 'GET'
      };

      try {
        const response = await fetch(availableVehicles.freeBikeStatusUrl, options);

        const data = await response.json();
        const status = response.status;
        const ok = response.ok;

        if (ok && status === 200 && typeof data?.station_id === 'string') {
          setAvailableVehiclesData(data);
        }
      } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      {!!categoryName && (
        <Wrapper>
          <CategoryText large>{categoryName}</CategoryText>
        </Wrapper>
      )}

      <SectionHeader title={texts.pointOfInterest.availableBikes} />

      {!!availableVehiclesData && (
        <Wrapper>
          <WrapperRow spaceBetween>
            <RegularText style={styles.vehicles}>{texts.pointOfInterest.bike}</RegularText>
            <RegularText style={styles.vehicles}>
              {availableVehiclesData.num_bikes_available}
            </RegularText>
          </WrapperRow>
        </Wrapper>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  vehicles: {
    marginRight: normalize(8),
    fontWeight: '600',
    fontSize: normalize(14),
    lineHeight: normalize(20)
  }
});
