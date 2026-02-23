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

const getComponent = (query: keyof typeof QUERY_TYPES) => {
  switch (query) {
    case QUERY_TYPES.NEWS_ITEM:
      return NewsForm;
    case QUERY_TYPES.POINT_OF_INTEREST:
      return PointOfInterestForm;
    case QUERY_TYPES.EVENT_RECORD:
      return EventForm;
    default:
      return NewsForm;
  }
};

export const ProfileCreateContentFormScreen = ({ route }: StackScreenProps<any>) => {
  const query = route.params?.query;
  const headlineInfo = route.params?.headlineInfo;

  const Component = getComponent(query);

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

          <Component headlineInfo={headlineInfo} />
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
