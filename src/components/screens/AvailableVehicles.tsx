import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { ListItem } from 'react-native-elements';

import { Icon, colors, normalize, texts } from '../../config';
import { LoadingContainer } from '../LoadingContainer';
import { SectionHeader } from '../SectionHeader';
import { CategoryText, RegularText } from '../Text';
import { Wrapper } from '../Wrapper';

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
  category: { name: string; iconName: keyof typeof Icon };
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

      {!!availableVehiclesData && !!availableVehiclesData.length && category?.iconName ? (
        availableVehiclesData.map((item: AvailableVehiclesProps) => (
          <ListItem key={item.id} bottomDivider>
            <ListItem.Content>
              <View style={styles.vehiclesContainer}>
                <CategoryIcon iconName={category.iconName} />
                <RegularText style={styles.vehicles}>{item.name}</RegularText>
              </View>
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

const CategoryIcon: React.FC<{ iconName: keyof typeof Icon }> = ({
  iconName
}: {
  iconName: keyof typeof Icon;
}) => {
  let SelectedIcon;
  if (iconName) {
    if (Object.keys(Icon).includes(iconName)) {
      SelectedIcon = Icon[iconName];
    }
  }

  /* @ts-expect-error could not find a solution for this type issue :/ */
  return SelectedIcon ? <SelectedIcon size={normalize(24)} color={colors.darkText} /> : null;
};

const styles = StyleSheet.create({
  vehicles: {
    marginRight: normalize(8),
    fontWeight: '600',
    fontSize: normalize(14),
    lineHeight: normalize(20)
  },
  vehiclesContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  }
});
