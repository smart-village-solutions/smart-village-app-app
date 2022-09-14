import { StackScreenProps } from '@react-navigation/stack';
import PropTypes from 'prop-types';
import React, { useRef } from 'react';
import { ScrollView } from 'react-native';

import {
  DefaultKeyboardAvoidingView,
  SafeAreaViewFlex,
  VolunteerFormCalendar,
  VolunteerFormConversation,
  VolunteerFormGroup,
  VolunteerFormProfile,
  WrapperWithOrientation
} from '../../components';
import { QUERY_TYPES } from '../../queries';

export const VolunteerFormScreen = ({ navigation, route }: StackScreenProps<any>) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const query = route.params?.query ?? '';
  const selectedUserIds = route.params?.selectedUserIds || [];
  const groupId = route.params?.groupId;
  const userData = route.params?.userData;

  if (!query) return null;

  const Form = {
    [QUERY_TYPES.VOLUNTEER.CALENDAR]: VolunteerFormCalendar,
    [QUERY_TYPES.VOLUNTEER.CONVERSATION]: VolunteerFormConversation,
    [QUERY_TYPES.VOLUNTEER.GROUP]: VolunteerFormGroup,
    [QUERY_TYPES.VOLUNTEER.PROFILE]: VolunteerFormProfile
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
              selectedUserIds={selectedUserIds}
              groupId={groupId}
              userData={userData}
            />
          </WrapperWithOrientation>
        </ScrollView>
      </DefaultKeyboardAvoidingView>
    </SafeAreaViewFlex>
  );
};

VolunteerFormScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired
};
