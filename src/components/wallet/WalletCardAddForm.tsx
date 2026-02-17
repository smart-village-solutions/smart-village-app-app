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
  isPinVisible?: boolean;
  maxCardNumberLength?: number;
  maxPinLength?: number;
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
    isPinVisible = false,
    maxCardNumberLength = 12,
    maxPinLength = 3
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
      iconBackgroundColor: cardInformation?.iconBackgroundColor,
      cardName: cardData.cardName,
      cardNumber: cardData.cardNumber,
      description: cardInformation?.description,
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
          maxLength={maxCardNumberLength}
          name="cardNumber"
          placeholder={cardNumberInputPlaceholder}
          rules={{
            minLength: {
              value: maxCardNumberLength,
              message: texts.wallet.add.inputs.errors.maxLengthExceeded(maxCardNumberLength)
            },
            required: {
              value: true,
              message: texts.wallet.add.inputs.errors.cardNumberRequired
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
          maxLength={maxPinLength}
          name="pinCode"
          placeholder={cardPinInputPlaceholder}
          rules={{
            minLength: {
              value: maxPinLength,
              message: texts.wallet.add.inputs.errors.maxLengthExceeded(maxPinLength)
            },
            required: {
              value: true,
              message: texts.wallet.add.inputs.errors.cardPinRequired
            }
          }}
          secureTextEntry={!isPinVisible}
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
