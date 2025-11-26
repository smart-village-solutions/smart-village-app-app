import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useCallback, useContext, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  Button,
  HtmlView,
  LoadingSpinner,
  SafeAreaViewFlex,
  WalletHeader,
  WalletList,
  Wrapper,
  WrapperRow,
  WrapperVertical
} from '../../components';
import { colors, Icon, normalize, texts } from '../../config';
import { deleteAllCards, getSavedCards } from '../../helpers';
import { SettingsContext } from '../../SettingsProvider';
import { ScreenName, TCard } from '../../types';

// TODO: Remove before production
const isDevMode = true;

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
        onPress={() => {
          navigation.navigate(ScreenName.WalletCardsList);
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
          <WalletHeader
            description={description}
            iconBackgroundColor={homeIconBackgroundColor}
            iconColor={iconColor}
            iconName={homeIcon}
            type={title}
          />

          <Wrapper>{footer({ buttonText, infoIcon, infoText, navigation })}</Wrapper>
        </WrapperVertical>
      </SafeAreaViewFlex>
    );
  }

  const listItem = cards.map((card: TCard) => ({
    leftIcon: (
      <Wrapper style={[styles.iconContainer, { backgroundColor: card.iconBackgroundColor }]}>
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
    <WalletList
      items={listItem}
      ListFooterComponent={() => (
        <WrapperVertical>{footer({ buttonText, infoIcon, infoText, navigation })}</WrapperVertical>
      )}
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
