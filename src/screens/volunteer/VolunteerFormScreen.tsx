import { StackScreenProps } from '@react-navigation/stack';
import PropTypes from 'prop-types';
import React, { useRef } from 'react';
import { ScrollView } from 'react-native';

import {
  DefaultKeyboardAvoidingView,
  SafeAreaViewFlex,
  VolunteerFormCalendar,
  VolunteerFormGroup,
  VolunteerMessageTextField,
  WrapperWithOrientation
} from '../../components';
import { QUERY_TYPES } from '../../queries';

export const VolunteerFormScreen = ({ navigation, route }: StackScreenProps<any>) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const query = route.params?.query ?? '';
  const queryVariables = route.params?.queryVariables ?? {};

  if (!query) return null;

  const Form = {
    [QUERY_TYPES.VOLUNTEER.CALENDAR]: VolunteerFormCalendar,
    [QUERY_TYPES.VOLUNTEER.GROUP]: VolunteerFormGroup,
    [QUERY_TYPES.VOLUNTEER.MESSAGES]: null,
    [QUERY_TYPES.VOLUNTEER.TASKS]: null
  }[query];

  if (!Form) return null;

  return (
    <SafeAreaViewFlex>
      <DefaultKeyboardAvoidingView>
        <ScrollView keyboardShouldPersistTaps="handled" ref={scrollViewRef}>
          <WrapperWithOrientation>
            <Form
              navigation={navigation}
              scrollToTop={() =>
                scrollViewRef?.current?.scrollTo({
                  x: 0,
                  y: 0,
                  animated: true
                })
              }
            />
          </WrapperWithOrientation>
        </ScrollView>
        {query === QUERY_TYPES.VOLUNTEER.MESSAGES && <VolunteerMessageTextField />}
      </DefaultKeyboardAvoidingView>
    </SafeAreaViewFlex>
  );
};

VolunteerFormScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired
};
