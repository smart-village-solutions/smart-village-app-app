import { StackScreenProps } from '@react-navigation/stack';
import React from 'react';
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
  const query = route.params?.query;
  const headlineInfo = route.params?.headlineInfo;
  const formContent =
    query === QUERY_TYPES.POINT_OF_INTEREST ? (
      <PointOfInterestForm />
    ) : query === QUERY_TYPES.EVENT_RECORD ? (
      <EventForm />
    ) : (
      <NewsForm />
    );

  return (
    <SafeAreaViewFlex>
      <DefaultKeyboardAvoidingView>
        <ScrollView
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
