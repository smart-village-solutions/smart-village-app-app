import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, TouchableOpacity } from 'react-native';

import { Icon, texts } from '../../config';
import { ErrorSavingCard, saveCard } from '../../helpers';
import { fetchCardInfo } from '../../queries';
import { CardType, ScreenName, TApiConnection, TCard } from '../../types';
import { Button } from '../Button';
import { Input } from '../form';
import { RegularText } from '../Text';
import { Wrapper } from '../Wrapper';

type TInputsInformation = {
  cardNameInputPlaceholder?: string;
  cardNameInputTitle?: string;
  cardNumberHint?: string;
  cardNumberInputPlaceholder?: string;
  cardNumberInputTitle?: string;
  cardNumberLength?: number;
  cardPinInputPlaceholder?: string;
  cardPinInputTitle?: string;
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
  inputsInformation,
  scannedCardNumber = '',
  setIsScannerOpen
}: {
  apiConnection: TApiConnection;
  cardInformation?: TCard;
  inputsInformation?: TInputsInformation;
  scannedCardNumber?: string;
  setIsScannerOpen: (isOpen: boolean) => void;
}) => {
  const navigation = useNavigation<StackNavigationProp<Record<string, any>>>();

  const {
    cardNameInputPlaceholder = texts.wallet.add.inputs.cardNameInputPlaceholder,
    cardNameInputTitle = texts.wallet.add.inputs.cardNameInputTitle,
    cardNumberHint = texts.wallet.add.inputs.cardNumberHint,
    cardNumberInputPlaceholder = texts.wallet.add.inputs.cardNumberInputPlaceholder,
    cardNumberInputTitle = texts.wallet.add.inputs.cardNumberInputTitle,
    cardNumberLength = 12,
    cardPinInputPlaceholder = texts.wallet.add.inputs.cardPinInputPlaceholder,
    cardPinInputTitle = texts.wallet.add.inputs.cardPinInputTitle,
    pinLength = 3
  } = inputsInformation || {};
  const {
    description,
    iconBackgroundColor,
    iconColor,
    iconName,
    title,
    type: cardType
  } = cardInformation || {};

  const {
    control,
    formState: { errors },
    handleSubmit,
    setValue
  } = useForm({
    mode: 'onBlur',
    defaultValues: {
      cardName: '',
      cardNumber: scannedCardNumber || '',
      pinCode: ''
    }
  });

  useEffect(() => {
    if (scannedCardNumber) {
      setValue('cardNumber', scannedCardNumber);
    }
  }, [scannedCardNumber, setValue]);

  const onSubmit = async (cardData: CardFormData) => {
    const cardInfo = {
      apiConnection,
      cardName: cardData.cardName,
      cardNumber: cardData.cardNumber,
      description,
      iconBackgroundColor,
      iconColor,
      iconName,
      pinCode: cardData.pinCode,
      title,
      type: cardType
    } as TCard;

    try {
      if (cardType === CardType.COUPON) {
        await fetchCardInfo({
          apiConnection,
          cardNumber: cardData.cardNumber,
          cardPin: cardData.pinCode
        });
      }

      await saveCard(cardInfo);

      navigation.popTo(ScreenName.WalletHome);
    } catch (error) {
      if (error?.message === ErrorSavingCard.DUPLICATE_CARD) {
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
          keyboardType={cardType === CardType.COUPON ? 'number-pad' : 'default'}
          label={cardNumberInputTitle}
          maxLength={cardNumberLength}
          name="cardNumber"
          placeholder={cardNumberInputPlaceholder}
          rightIcon={
            <TouchableOpacity onPress={() => setIsScannerOpen(true)}>
              <Icon.NamedIcon name="scan" />
            </TouchableOpacity>
          }
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
        <RegularText smallest>{cardNumberHint}</RegularText>
      </Wrapper>

      {cardType === CardType.COUPON && (
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
      )}

      <Wrapper noPaddingTop>
        <Input
          control={control}
          label={cardNameInputTitle}
          name="cardName"
          placeholder={cardNameInputPlaceholder}
        />
      </Wrapper>

      <Wrapper noPaddingTop noPaddingBottom>
        <Button title={texts.wallet.add.button} onPress={handleSubmit(onSubmit)} />
      </Wrapper>
    </>
  );
};
