import _upperFirst from 'lodash/upperFirst';
import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { Divider, ListItem } from 'react-native-elements';

import { Icon, IconUrl, colors, normalize, texts } from '../../config';
import { LoadingContainer } from '../LoadingContainer';
import { SectionHeader } from '../SectionHeader';
import { RegularText } from '../Text';
import { Wrapper, WrapperHorizontal } from '../Wrapper';

type AvailableVehiclesProps = {
  id: string;
  name: string;
  count?: number;
};

export const AvailableVehicles = ({
  freeStatusUrl,
  iconName
}: {
  freeStatusUrl: string;
  iconName: string;
}) => {
  const [availableVehiclesData, setAvailableVehiclesData] = useState<AvailableVehiclesProps[]>();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(freeStatusUrl);

        const data = await response.json();
        const status = response.status;
        const ok = response.ok;

        if (ok && status === 200 && !!data?.available) {
          setAvailableVehiclesData(getCountArray(data.available));
        }
      } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getCountArray = useCallback((vehicles: AvailableVehiclesProps[]) => {
    const vehicleCounts = vehicles.reduce<Record<string, number>>((accumulator, vehicle) => {
      accumulator[vehicle.name] = (accumulator[vehicle.name] || 0) + 1;
      return accumulator;
    }, {});

    return Object.keys(vehicleCounts).map((key) => ({
      id: key,
      name: key,
      count: vehicleCounts[key]
    }));
  }, []);

  if (loading) {
    return (
      <>
        <SectionHeader title={texts.pointOfInterest.availableVehicles} />

        <LoadingContainer>
          <ActivityIndicator color={colors.refreshControl} />
        </LoadingContainer>
      </>
    );
  }

  return (
    <>
      <SectionHeader title={texts.pointOfInterest.availableVehicles} />

      {availableVehiclesData?.length ? (
        availableVehiclesData.map((item: AvailableVehiclesProps, index: number) => (
          <Fragment key={item.id}>
            <ListItem containerStyle={styles.container}>
              {!!iconName && <IconUrl iconName={iconName} />}
              <ListItem.Content style={styles.contentContainer}>
                <RegularText>{item.name}</RegularText>
                <RegularText>{item.count}</RegularText>
              </ListItem.Content>
            </ListItem>
            {index !== availableVehiclesData.length - 1 && (
              <WrapperHorizontal>
                <Divider style={styles.divider} />
              </WrapperHorizontal>
            )}
          </Fragment>
        ))
      ) : (
        <Wrapper>
          <RegularText placeholder small>
            {texts.pointOfInterest.noAvailableVehicles}
          </RegularText>
        </Wrapper>
      )}

      <WrapperHorizontal>
        <Divider />
      </WrapperHorizontal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.transparent,
    padding: normalize(14)
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  divider: {
    backgroundColor: colors.placeholder
  }
});
