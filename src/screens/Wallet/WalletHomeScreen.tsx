import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useCallback, useContext, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  Button,
  HeadlineText,
  HtmlView,
  ListComponent,
  LoadingSpinner,
  RegularText,
  SafeAreaViewFlex,
  Wrapper,
  WrapperRow,
  WrapperVertical
} from '../../components';
import { colors, Icon, normalize, texts } from '../../config';
import { deleteAllCards, getSavedCards, saveCard, TCard } from '../../helpers';
import { QUERY_TYPES } from '../../queries';
import { SettingsContext } from '../../SettingsProvider';

// TODO: Remove before production
const isDevMode = true;
const testCardInfo = {
  backgroundColor: 'blue',
  cardName: 'My Visa Card',
  cardNumber: '1234567890123456',
  description: 'Personal credit card',
  iconColor: 'white',
  iconName: 'credit-card',
  pinCode: '123',
  type: 'visa'
};

const footer = ({
  buttonText,
  infoIcon,
  infoText,
  navigation
}: {
  buttonText: string;
  infoIcon: string;
  infoText: string;
  navigation: StackNavigationProp<Record<string, any>>;
}) => {
  return (
    // TODO: Replace console.warn with actual functionality
    <>
      <Button
        title={buttonText}
        onPress={async () => {
          if (isDevMode) {
            // TODO: Replace with actual card addition logic

            try {
              await saveCard(testCardInfo);
            } catch (error) {
              console.error('Error saving test card:', error);
            }
          }

          // TODO: Navigate to card addition screen
          // navigation.navigate('');
        }}
      />

      {isDevMode && (
        // TODO: Remove dev mode delete button before production
        <Button
          title={'delete card'}
          onPress={() => deleteAllCards().then(() => console.warn('All cards deleted'))}
        />
      )}

      <View style={styles.infoContainer}>
        <WrapperRow>
          <Icon.NamedIcon name={infoIcon} style={styles.infoIcon} />

          <View style={styles.infoTextContainer}>
            <HtmlView html={infoText as string} />
          </View>
        </WrapperRow>
      </View>
    </>
  );
};

export const WalletHomeScreen = () => {
  const navigation = useNavigation<StackNavigationProp<Record<string, any>>>();
  const walletHomeTexts = texts.wallet.home;
  const { globalSettings } = useContext(SettingsContext);
  const { settings = {} } = globalSettings;
  const { wallet = {} } = settings;
  const {
    buttonText = walletHomeTexts.buttonText,
    description = walletHomeTexts.description,
    homeIcon = 'wallet',
    homeIconBackgroundColor = colors.lighterPrimaryRgba,
    iconColor = colors.primary,
    infoIcon = 'info-circle',
    infoText = walletHomeTexts.infoText,
    title = walletHomeTexts.title
  } = wallet;

  const [cards, setCards] = useState<TCard[]>([]);
  const [savedCardsLoading, setSavedCardsLoading] = useState<boolean>(true);

  const fetchCards = useCallback(async () => {
    const savedCards = await getSavedCards();

    if (savedCards?.length) {
      setCards(savedCards);
    } else {
      setCards([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchCards();
      setSavedCardsLoading(false);
    }, [fetchCards])
  );

  if (savedCardsLoading) {
    return <LoadingSpinner loading />;
  }

  if (!cards?.length) {
    return (
      <SafeAreaViewFlex>
        <WrapperVertical>
          <Wrapper
            itemsCenter
            style={[styles.iconContainer, { backgroundColor: homeIconBackgroundColor }]}
          >
            <Icon.NamedIcon name={homeIcon} size={normalize(50)} color={iconColor} />
          </Wrapper>

          <Wrapper itemsCenter>
            <WrapperVertical>
              <HeadlineText biggest>{title}</HeadlineText>
            </WrapperVertical>

            <RegularText center>{description}</RegularText>
          </Wrapper>

          <Wrapper>{footer({ buttonText, infoIcon, infoText, navigation })}</Wrapper>
        </WrapperVertical>
      </SafeAreaViewFlex>
    );
  }

  const listItem = cards.map((card) => ({
    leftIcon: (
      <Wrapper style={[styles.iconContainer, { backgroundColor: card.backgroundColor }]}>
        <Icon.NamedIcon name={card.iconName} color={card.iconColor} />
      </Wrapper>
    ),
    params: { cardNumber: card.cardNumber },
    // TODO: Update routeName to actual screen name for card details
    // routeName: '',
    subtitle: card.description,
    title: card.cardName || card.type
  }));

  return (
    <ListComponent
      data={listItem}
      ListFooterComponent={() => (
        <WrapperVertical>{footer({ buttonText, infoIcon, infoText, navigation })}</WrapperVertical>
      )}
      navigation={navigation}
      query={QUERY_TYPES.WALLET}
    />
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    alignSelf: 'center',
    borderRadius: normalize(50)
  },
  infoContainer: {
    borderColor: colors.primary,
    borderRadius: normalize(8),
    borderWidth: normalize(2),
    padding: normalize(10)
  },
  infoIcon: {
    marginRight: normalize(8)
  },
  infoTextContainer: {
    width: '90%'
  }
});
