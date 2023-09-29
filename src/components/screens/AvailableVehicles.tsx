import _upperFirst from 'lodash/upperFirst';
import React, { Fragment, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { Divider, ListItem } from 'react-native-elements';

import { Icon, colors, normalize, texts } from '../../config';
import { LoadingContainer } from '../LoadingContainer';
import { SectionHeader } from '../SectionHeader';
import { RegularText } from '../Text';

type AvailableVehiclesProps = {
  id: string;
  name: string;
};

export const AvailableVehicles = ({
  freeStatusUrl,
  iconName
}: {
  freeStatusUrl: string;
  iconName: keyof typeof Icon;
}) => {
  const [availableVehiclesData, setAvailableVehiclesData] = useState<AvailableVehiclesProps[]>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(freeStatusUrl);

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

  if (!availableVehiclesData?.length) {
    return (
      <LoadingContainer>
        <ActivityIndicator color={colors.refreshControl} />
      </LoadingContainer>
    );
  }

  const CategoryIcon = Icon[_upperFirst(iconName) as keyof typeof Icon];

  return (
    <>
      <SectionHeader title={texts.pointOfInterest.availableVehicles} />

      {availableVehiclesData.map((item: AvailableVehiclesProps, index: number) => (
        <Fragment key={item.id}>
          <ListItem style={styles.container} containerStyle={styles.container}>
            {!!iconName && <CategoryIcon />}
            <ListItem.Content>
              <RegularText>{item.name}</RegularText>
            </ListItem.Content>
          </ListItem>
          {index !== availableVehiclesData.length - 1 && <Divider style={styles.divider} />}
        </Fragment>
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.transparent,
    paddingVertical: normalize(12)
  },
  divider: {
    backgroundColor: colors.placeholder
  }
});
