import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useCallback, useContext, useMemo, useState } from 'react';
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
import { getSavedCards } from '../../helpers';
import { useStaticContent } from '../../hooks';
import { SettingsContext } from '../../SettingsProvider';
import { ScreenName, TCard } from '../../types';

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
    <>
      <Button
        title={buttonText}
        onPress={() => {
          navigation.navigate(ScreenName.WalletCardsList, {
            title: texts.screenTitles.wallet.cardsList
          });
        }}
      />

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

  const { data: cardTypes } = useStaticContent<TCard[]>({
    refreshTimeKey: 'publicJsonFile-walletCardTypes',
    name: 'walletCardTypes',
    type: 'json'
  });

  const cardTypeMap = useMemo(() => {
    const map = new Map<string, TCard>();

    cardTypes?.forEach((ct) => map.set(ct.type, ct));

    return map;
  }, [cardTypes]);

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

  const listItem = cards
    .filter((card: TCard) => {
      const serverCardType = cardTypeMap.get(card.type);

      return serverCardType?.isVisible !== false;
    })
    .map((card: TCard) => {
      const serverCardType = cardTypeMap.get(card.type);
      const iconBackgroundColor = serverCardType?.iconBackgroundColor ?? card.iconBackgroundColor;
      const iconColor = serverCardType?.iconColor ?? card.iconColor;

      return {
        leftIcon: (
          <Wrapper style={[styles.iconContainer, { backgroundColor: iconBackgroundColor }]}>
            <Icon.NamedIcon name={card.iconName} color={iconColor} />
          </Wrapper>
        ),
        params: { card, title: texts.screenTitles.wallet.detail },
        routeName: ScreenName.WalletCardDetail,
        subtitle: card.description,
        title: card.cardName || card.title
      };
    });

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
