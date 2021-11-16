import { NavigationProp } from '@react-navigation/core';
import React, { useCallback } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { texts } from '../../config';
import { usePullToRefetch, useStaticContent } from '../../hooks';
import { parseEncounterWelcome } from '../../jsonValidation';
import { ScreenName } from '../../types';
import { Button } from '../Button';
import { Image } from '../Image';
import { LoadingSpinner } from '../LoadingSpinner';
import { SafeAreaViewFlex } from '../SafeAreaViewFlex';
import { SectionHeader } from '../SectionHeader';
import { RegularText } from '../Text';
import { Wrapper, WrapperWithOrientation } from '../Wrapper';

type Props = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  navigation: NavigationProp<any>;
  onPressToCategory?: () => void;
};

export const EncounterWelcome = ({ navigation, onPressToCategory }: Props) => {
  const { data, error, loading, refetch } = useStaticContent({
    type: 'json',
    name: 'encounterWelcome',
    parseFromJson: parseEncounterWelcome
  });

  const onPressRegister = useCallback(() => {
    navigation.navigate(ScreenName.EncounterRegistration);
  }, [navigation]);

  const RefreshControl = usePullToRefetch(refetch);

  if (!data && loading) {
    return <LoadingSpinner loading />;
  }

  if (error) {
    return (
      <SafeAreaViewFlex>
        <Wrapper>
          <RegularText>{texts.encounter.errorLoadingUser}</RegularText>
        </Wrapper>
      </SafeAreaViewFlex>
    );
  }

  return (
    <SafeAreaViewFlex>
      <ScrollView refreshControl={RefreshControl}>
        <WrapperWithOrientation>
          <View style={styles.imageContainer}>
            <Image source={{ uri: data.imageUrl }} />
          </View>
          <SectionHeader title={data.welcomeTitle} />
          <Wrapper>
            <RegularText>{data.welcomeText}</RegularText>
          </Wrapper>
          <Wrapper>
            <Button title={texts.encounter.registerNow} onPress={onPressRegister} />
            {onPressToCategory && (
              <Button title={texts.encounter.toCategory} onPress={onPressToCategory} />
            )}
          </Wrapper>
        </WrapperWithOrientation>
      </ScrollView>
    </SafeAreaViewFlex>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    alignItems: 'center'
  }
});
