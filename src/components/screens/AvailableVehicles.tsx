import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { ListItem } from 'react-native-elements';

import { Icon, colors, normalize, texts } from '../../config';
import { LoadingContainer } from '../LoadingContainer';
import { SectionHeader } from '../SectionHeader';
import { CategoryText, RegularText } from '../Text';
import { Wrapper, WrapperRow } from '../Wrapper';

type StationProps = {
  freeStatusUrl: string;
  id: string;
};

type AvailableVehiclesProps = {
  id: string;
  name: string;
};

export const AvailableVehicles = ({
  availableVehicles,
  category
}: {
  availableVehicles: StationProps;
  category: { name: string };
}) => {
  const [availableVehiclesData, setAvailableVehiclesData] = useState<AvailableVehiclesProps[]>();

  useEffect(() => {
    const fetchData = async () => {
      const options = {
        method: 'GET'
      };

      try {
        const response = await fetch(availableVehicles.freeStatusUrl, options);

        const data = await response.json();
        const status = response.status;
        const ok = response.ok;

        if (ok && status === 200 && !!data?.available) {
          setAvailableVehiclesData(data.available);
        }
      } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      {!!category?.name && (
        <Wrapper>
          <CategoryText large>{category.name}</CategoryText>
        </Wrapper>
      )}

      <SectionHeader
        title={
          category?.name.includes('bike')
            ? texts.pointOfInterest.availableBikes
            : texts.pointOfInterest.availableCars
        }
      />

      {!!availableVehiclesData && !!availableVehiclesData.length ? (
        availableVehiclesData.map((item: AvailableVehiclesProps) => (
          <ListItem key={item.id} bottomDivider>
            <ListItem.Content>
              <WrapperRow spaceBetween>
                <RegularText style={styles.vehicles}>{item.name}</RegularText>
              </WrapperRow>
            </ListItem.Content>
          </ListItem>
        ))
      ) : (
        <LoadingContainer>
          <ActivityIndicator color={colors.refreshControl} />
        </LoadingContainer>
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
