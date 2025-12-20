import React, { useContext } from 'react';
import { StyleSheet, View } from 'react-native';

import { SettingsContext } from '../SettingsProvider';
import { consts } from '../config';

import { Button } from './Button';

const { EVENT_SUGGESTION_BUTTON } = consts;

export const EventSuggestionButton = ({
  buttonTitle,
  onPress
}: {
  buttonTitle: string;
  onPress: () => void;
}) => {
  const { globalSettings } = useContext(SettingsContext);
  const { navigation: navigationType, sections = {} } = globalSettings;
  const { eventListIntro } = sections;

  return (
    <View
      style={
        eventListIntro.buttonType === EVENT_SUGGESTION_BUTTON.BOTTOM_FLOATING && [
          styles.floatingButtonContainer,
          stylesWithProps({ navigationType }).position
        ]
      }
    >
      <Button
        onPress={onPress}
        title={buttonTitle}
        notFullWidth={eventListIntro.buttonType === EVENT_SUGGESTION_BUTTON.BOTTOM_FLOATING}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  floatingButtonContainer: {
    alignSelf: 'center',
    position: 'absolute'
  }
});

/* eslint-disable react-native/no-unused-styles */
/* this works properly, we do not want that warning */
const stylesWithProps = ({ navigationType }: { navigationType: string }) => {
  return StyleSheet.create({
    position: {
      bottom: navigationType === 'drawer' ? '5%' : 0
    }
  });
};
/* eslint-enable react-native/no-unused-styles */
