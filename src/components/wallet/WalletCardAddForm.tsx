import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { useForm } from 'react-hook-form';
import { Alert } from 'react-native';

import { texts } from '../../config';
import { saveCard } from '../../helpers';
import { fetchCardInfo } from '../../queries';
import { TApiConnection, TCard } from '../../types';
import { Button } from '../Button';
import { Input } from '../form';
import { Wrapper } from '../Wrapper';

type TInputsInformation = {
  cardNameInputPlaceholder?: string;
  cardNameInputTitle?: string;
  cardNumberInputPlaceholder?: string;
  cardNumberInputTitle?: string;
  cardPinInputPlaceholder?: string;
  cardPinInputTitle?: string;
  cardNumberLength?: number;
  pinLength?: number;
};

type CardFormData = {
  cardName: string;
  cardNumber: string;
  pinCode: string;
};

export const WalletCardAddForm = ({
  apiConnection,
  cardInformation,
  inputsInformation
}: {
  apiConnection: TApiConnection;
  cardInformation?: TCard;
  inputsInformation?: TInputsInformation;
}) => {
  const navigation = useNavigation<StackNavigationProp<Record<string, any>>>();

  const {
    cardNameInputPlaceholder = texts.wallet.add.inputs.cardNameInputPlaceholder,
    cardNameInputTitle = texts.wallet.add.inputs.cardNameInputTitle,
    cardNumberInputPlaceholder = texts.wallet.add.inputs.cardNumberInputPlaceholder,
    cardNumberInputTitle = texts.wallet.add.inputs.cardNumberInputTitle,
    cardPinInputPlaceholder = texts.wallet.add.inputs.cardPinInputPlaceholder,
    cardPinInputTitle = texts.wallet.add.inputs.cardPinInputTitle,
    cardNumberLength = 12,
    pinLength = 3
  } = inputsInformation || {};

  const {
    control,
    formState: { errors },
    handleSubmit
  } = useForm({
    mode: 'onBlur',
    defaultValues: {
      cardName: '',
      cardNumber: '',
      pinCode: ''
    }
  });

  const onSubmit = async (cardData: CardFormData) => {
    const cardInfo = {
      apiConnection,
      cardName: cardData.cardName,
      cardNumber: cardData.cardNumber,
      description: cardInformation?.description,
      iconBackgroundColor: cardInformation?.iconBackgroundColor,
      iconColor: cardInformation?.iconColor,
      iconName: cardInformation?.iconName,
      pinCode: cardData.pinCode,
      type: cardInformation?.type
    } as TCard;

    try {
      await fetchCardInfo({
        apiConnection,
        cardNumber: cardData.cardNumber,
        cardPin: cardData.pinCode
      });

      await saveCard(cardInfo);

      navigation.pop(2);
    } catch (error) {
      if (error?.message === 'Duplicate card') {
        return Alert.alert(
          texts.wallet.alert.duplicateCardTitle,
          texts.wallet.alert.duplicateCardMessage
        );
      }

      Alert.alert(texts.wallet.alert.invalidCardTitle, texts.wallet.alert.invalidCardMessage);
      console.error('Error saving card:', error);
    }
  };

  return (
    <>
      <Wrapper>
        <Input
          control={control}
          errorMessage={errors.cardNumber && errors.cardNumber.message}
          keyboardType="number-pad"
          label={cardNumberInputTitle}
          maxLength={cardNumberLength}
          name="cardNumber"
          placeholder={cardNumberInputPlaceholder}
          rules={{
            minLength: {
              value: cardNumberLength,
              message: texts.wallet.add.inputs.errors.lengthExceeded(
                cardNumberInputTitle,
                cardNumberLength
              )
            },
            required: {
              value: true,
              message: texts.wallet.add.inputs.errors.cardNumberRequired(cardNumberInputTitle)
            }
          }}
        />
      </Wrapper>

      <Wrapper noPaddingTop>
        <Input
          control={control}
          errorMessage={errors.pinCode && errors.pinCode.message}
          keyboardType="number-pad"
          label={cardPinInputTitle}
          maxLength={pinLength}
          name="pinCode"
          placeholder={cardPinInputPlaceholder}
          rules={{
            minLength: {
              value: pinLength,
              message: texts.wallet.add.inputs.errors.lengthExceeded(cardPinInputTitle, pinLength)
            },
            required: {
              value: true,
              message: texts.wallet.add.inputs.errors.cardPinRequired(cardPinInputTitle)
            }
          }}
          secureTextEntry
        />
      </Wrapper>

      <Wrapper noPaddingTop>
        <Input
          control={control}
          label={cardNameInputTitle}
          name="cardName"
          placeholder={cardNameInputPlaceholder}
        />
      </Wrapper>

      <Wrapper noPaddingTop>
        <Button title={texts.wallet.add.button} onPress={handleSubmit(onSubmit)} />
      </Wrapper>
    </>
  );
};
