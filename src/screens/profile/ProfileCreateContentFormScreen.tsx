import { StackScreenProps } from '@react-navigation/stack';
import React, { useRef } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import {
  DefaultKeyboardAvoidingView,
  EventForm,
  NewsForm,
  PointOfInterestForm,
  RegularText,
  SafeAreaViewFlex,
  Wrapper
} from '../../components';
import { normalize } from '../../config';
import { QUERY_TYPES } from '../../queries';

export const ProfileCreateContentFormScreen = ({ route }: StackScreenProps<any>) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const query = route.params?.query;
  const headlineInfo = route.params?.headlineInfo;
  const initialData = route.params?.initialData;
  const mode = route.params?.mode ?? 'create';
  const formContent =
    query === QUERY_TYPES.POINT_OF_INTEREST ? (
      <PointOfInterestForm initialData={initialData} mode={mode} scrollViewRef={scrollViewRef} />
    ) : query === QUERY_TYPES.EVENT_RECORD ? (
      <EventForm initialData={initialData} mode={mode} scrollViewRef={scrollViewRef} />
    ) : (
      <NewsForm initialData={initialData} mode={mode} scrollViewRef={scrollViewRef} />
    );

  return (
    <SafeAreaViewFlex>
      <DefaultKeyboardAvoidingView>
        <ScrollView
          ref={scrollViewRef}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.paddingBottom}
        >
          {!!headlineInfo && (
            <Wrapper>
              <RegularText>{headlineInfo}</RegularText>
            </Wrapper>
          )}

          {formContent}
        </ScrollView>
      </DefaultKeyboardAvoidingView>
    </SafeAreaViewFlex>
  );
};

const styles = StyleSheet.create({
  paddingBottom: {
    paddingBottom: normalize(20)
  }
});
