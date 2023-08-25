import { DrawerNavigationProp } from '@react-navigation/drawer';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Icon, colors, normalize } from '../config';
import { addToStore, findClosestItem, isActive, readFromStore } from '../helpers';
import { useHomeRefresh, useStaticContent } from '../hooks';

import { Button } from './Button';
import { Image } from './Image';
import { BoldText, RegularText } from './Text';
import { Wrapper, WrapperHorizontal } from './Wrapper';

type Props = {
  navigation: DrawerNavigationProp<any>;
  name: string;
};

interface DateRange {
  dateEnd: string;
  dateStart: string;
}

interface DataItem {
  backgroundColor?: string;
  button: {
    navigationTo: string;
    params: { title?: string; webUrl: string };
    title?: string;
  };
  category?: string;
  dates: DateRange[];
  description: string;
  id: number;
  picture?: { aspectRatio?: { HEIGHT: number; WIDTH: number }; uri: string };
  title: string;
}

// eslint-disable-next-line complexity
export const Disturber = ({ navigation, name }: Props) => {
  const [isVisible, setIsVisiblle] = useState(false);
  const refreshTimeKey = `publicJsonFile-${name}`;

  const { data, refetch } = useStaticContent<DataItem[]>({
    refreshTimeKey,
    name,
    type: 'json'
  });

  useHomeRefresh(refetch);

  // filter data for present items and items with active date/time periods
  const isActiveData = data?.filter((item) => item && isActive(item));

  // find the closest item to the current date/time
  const closestItem: DataItem | null = findClosestItem(isActiveData || []);

  const setDistruberComplete = () => {
    setIsVisiblle((prev) => !prev);
    addToStore(name, closestItem?.id.toString());
  };

  useEffect(() => {
    readFromStore(name).then((value) => {
      if (closestItem?.id && value !== closestItem?.id.toString()) setIsVisiblle(true);
    });
  }, [closestItem]);

  if (!isVisible || !closestItem) return null;

  return (
    <Wrapper style={{ padding: normalize(24) }}>
      <View style={[styles.containerRadius, { backgroundColor: closestItem.backgroundColor }]}>
        {!!closestItem && (
          <>
            <TouchableOpacity onPress={setDistruberComplete} style={styles.closeButton}>
              <Icon.Close color={colors.darkText} size={normalize(16)} />
            </TouchableOpacity>

            {!!closestItem.picture && (
              <Image
                source={closestItem.picture}
                borderRadius={normalize(8)}
                aspectRatio={closestItem.picture.aspectRatio || { HEIGHT: 0.7, WIDTH: 1 }}
                resizeMode={'cover'}
              />
            )}

            <Wrapper style={styles.noPaddingBottom}>
              <WrapperHorizontal>
                {!!closestItem.category && (
                  <BoldText center uppercase style={styles.categoryText}>
                    {closestItem.category}
                  </BoldText>
                )}
              </WrapperHorizontal>
            </Wrapper>

            <Wrapper style={styles.noPaddingTop}>
              <WrapperHorizontal>
                {!!closestItem.title && (
                  <BoldText center large>
                    {closestItem.title}
                  </BoldText>
                )}
              </WrapperHorizontal>
            </Wrapper>

            <Wrapper style={styles.noPaddingTop}>
              <WrapperHorizontal>
                {!!closestItem.description && (
                  <RegularText center>{closestItem.description}</RegularText>
                )}
              </WrapperHorizontal>
            </Wrapper>

            <Wrapper>
              <WrapperHorizontal>
                {!!closestItem.button && (
                  <Button
                    extraLarge
                    containerStyle={styles.containerRadius}
                    title={closestItem.button.title || 'Mehr'}
                    onPress={() =>
                      navigation.navigate(
                        closestItem.button.navigationTo,
                        closestItem.button.params
                      )
                    }
                  />
                )}
              </WrapperHorizontal>
            </Wrapper>
          </>
        )}
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  categoryText: {
    fontSize: normalize(14),
    fontWeight: '700',
    lineHeight: normalize(16),
    textTransform: 'uppercase'
  },
  closeButton: {
    alignItems: 'center',
    backgroundColor: colors.gray20,
    borderRadius: 25,
    height: normalize(32),
    justifyContent: 'center',
    opacity: 1,
    position: 'absolute',
    right: normalize(16),
    top: normalize(16),
    width: normalize(32),
    zIndex: 1
  },
  containerRadius: {
    borderRadius: normalize(8)
  },
  noPaddingBottom: {
    paddingBottom: 0
  },
  noPaddingTop: {
    paddingTop: 0
  }
});
