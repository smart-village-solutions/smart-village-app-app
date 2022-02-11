import PropTypes from 'prop-types';
import React from 'react';
import { ScrollView } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';

import {
  DefaultKeyboardAvoidingView,
  SafeAreaViewFlex,
  VolunteerFormCalendar,
  VolunteerMessageTextField,
  WrapperWithOrientation
} from '../../components';
import { QUERY_TYPES } from '../../queries';

export const VolunteerFormScreen = ({ navigation, route }: StackScreenProps<any>) => {
  const query = route.params?.query ?? '';
  const queryVariables = route.params?.queryVariables ?? {};

  if (!query) return null;

  const Form = {
    [QUERY_TYPES.VOLUNTEER.CALENDAR]: VolunteerFormCalendar,
    [QUERY_TYPES.VOLUNTEER.GROUPS]: null,
    [QUERY_TYPES.VOLUNTEER.GROUPS_FOLLOWING]: null,
    [QUERY_TYPES.VOLUNTEER.ALL_GROUPS]: null,
    [QUERY_TYPES.VOLUNTEER.MESSAGES]: null,
    [QUERY_TYPES.VOLUNTEER.TASKS]: null
  }[query];

  if (!Form) return null;

  return (
    <SafeAreaViewFlex>
      <DefaultKeyboardAvoidingView>
        <ScrollView keyboardShouldPersistTaps="handled">
          <WrapperWithOrientation>
            <Form navigation={navigation} />
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
