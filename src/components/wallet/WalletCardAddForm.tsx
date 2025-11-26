import React from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '../Button';
import { Input } from '../form';
import { Wrapper } from '../Wrapper';
import { texts } from '../../config';
import { TCard } from '../../types';
import { saveCard } from '../../helpers';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';

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

export const WalletCardAddForm = ({
  apiEndpoint,
  cardInformation,
  inputsInformation
}: {
  apiEndpoint: string;
  cardInformation?: TCard;
  inputsInformation: TInputsInformation;
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

  const onSubmit = async (cardData: TCard) => {
    const cardInfo = {
      apiEndpoint: apiEndpoint,
      backgroundColor: cardInformation?.iconBackgroundColor,
      cardName: cardData.cardName,
      cardNumber: cardData.cardNumber,
      description: cardInformation?.description,
      iconColor: cardInformation?.iconColor,
      iconName: cardInformation?.iconName,
      pinCode: cardData.pinCode,
      type: cardInformation?.type
    };

    try {
      const { saved, duplicate } = await saveCard(cardInfo);

      if (saved && !duplicate) {
        navigation.pop(2);
      }
    } catch (error) {
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
            pattern: {
              value: new RegExp(`^[0-9]{${maxCardNumberLength}}$`),
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
          errorMessage={errors.pin && errors.pin.message}
          keyboardType="number-pad"
          label={cardPinInputTitle}
          maxLength={maxPinLength}
          name="pinCode"
          placeholder={cardPinInputPlaceholder}
          rules={{
            pattern: {
              value: new RegExp(`^[0-9]{${maxPinLength}}$`),
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
        <Button title="Add Card" onPress={handleSubmit(onSubmit)} />
      </Wrapper>
    </>
  );
};
