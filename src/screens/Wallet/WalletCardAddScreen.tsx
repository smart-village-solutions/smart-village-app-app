import { RouteProp } from '@react-navigation/native';
import React, { useState } from 'react';
import { ScrollView } from 'react-native';

import {
  Button,
  DefaultKeyboardAvoidingView,
  SafeAreaViewFlex,
  WalletCardAddForm,
  WalletCardScanner,
  WalletHeader,
  Wrapper,
  WrapperVertical
} from '../../components';
import { texts } from '../../config';

export const WalletCardAddScreen = ({ route }: { route: RouteProp<any, any> }) => {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [cardNumber, setCardNumber] = useState('');

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

  if (isScannerOpen) {
    return <WalletCardScanner setIsScannerOpen={setIsScannerOpen} setCardNumber={setCardNumber} />;
  }

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
            scannedCardNumber={cardNumber}
          />

          <Wrapper noPaddingTop>
            <Button title={texts.wallet.add.cardScan} onPress={() => setIsScannerOpen(true)} />
          </Wrapper>
        </ScrollView>
      </DefaultKeyboardAvoidingView>
    </SafeAreaViewFlex>
  );
};
