import { RouteProp } from '@react-navigation/native';
import React from 'react';
import { ScrollView } from 'react-native';

import {
  DefaultKeyboardAvoidingView,
  SafeAreaViewFlex,
  WalletCardAddForm,
  WalletHeader,
  WrapperVertical
} from '../../components';
import { texts } from '../../config';

export const WalletCardAddScreen = ({ route }: { route: RouteProp<any, any> }) => {
  const { card } = route.params;
  const {
    addCardScreenSettings = {},
    apiConnection = {},
    iconBackgroundColor,
    iconColor,
    iconName
  } = card;
  const {
    description = texts.wallet.add.cardAddDescription,
    title = texts.wallet.add.cardAddTitle,
    inputsInformation = {}
  } = addCardScreenSettings;

  return (
    <SafeAreaViewFlex>
      <DefaultKeyboardAvoidingView>
        <ScrollView>
          <WrapperVertical>
            <WalletHeader
              description={description}
              iconBackgroundColor={iconBackgroundColor}
              iconColor={iconColor}
              iconName={iconName}
              type={title}
            />
          </WrapperVertical>

          <WalletCardAddForm
            apiConnection={apiConnection}
            cardInformation={card}
            inputsInformation={inputsInformation}
          />
        </ScrollView>
      </DefaultKeyboardAvoidingView>
    </SafeAreaViewFlex>
  );
};
