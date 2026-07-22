import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import { View } from 'react-native';

import {
  Button,
  HtmlView,
  LoadingSpinner,
  ReadAloudContent,
  SafeAreaViewFlex,
  WalletHeader,
  WalletList,
  Wrapper,
  WrapperRow,
  WrapperVertical
} from '../../components';
import { Icon, normalize, texts } from '../../config';
import { getSavedCards } from '../../helpers';
import { useStaticContent } from '../../hooks';
import { useTheme } from '../../hooks/useTheme';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import {
  useReadAloudPlayerBottomSpacing,
  useReadAloudScrollContentContainerStyle
} from '../../ReadAloudAvailabilityProvider';
import { SettingsContext } from '../../SettingsProvider';
import { ScreenName, TCard } from '../../types';

const Footer = ({
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
  const styles = useThemeStyles(createStyles);

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
            <ReadAloudContent content={infoText as string} contentId="wallet-home-info-content" />
            <HtmlView html={infoText as string} />
          </View>
        </WrapperRow>
      </View>
    </>
  );
};

export const WalletHomeScreen = () => {
  const { colors } = useTheme();
  const styles = useThemeStyles(createStyles);
  const navigation = useNavigation<StackNavigationProp<Record<string, any>>>();
  const listContentContainerStyle = useReadAloudScrollContentContainerStyle();
  const readAloudPlayerBottomSpacing = useReadAloudPlayerBottomSpacing();
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

  const [savedCards, setSavedCards] = useState<TCard[]>([]);
  const [savedCardsLoading, setSavedCardsLoading] = useState<boolean>(true);

  const fetchCards = useCallback(async () => {
    const savedCards = await getSavedCards();

    if (savedCards?.length) {
      setSavedCards(savedCards);
    } else {
      setSavedCards([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadCards = async () => {
        setSavedCardsLoading(true);

        try {
          await fetchCards();
        } finally {
          if (isActive) {
            setSavedCardsLoading(false);
          }
        }
      };

      loadCards();

      return () => {
        isActive = false;
      };
    }, [fetchCards])
  );

  if (savedCardsLoading) {
    return <LoadingSpinner loading />;
  }

  if (!savedCards?.length) {
    return (
      <SafeAreaViewFlex style={{ paddingBottom: readAloudPlayerBottomSpacing }}>
        <WrapperVertical>
          <WalletHeader
            description={description}
            iconBackgroundColor={homeIconBackgroundColor}
            iconColor={iconColor}
            iconName={homeIcon}
            type={title}
          />

          <Wrapper>
            <Footer
              buttonText={buttonText}
              infoIcon={infoIcon}
              infoText={infoText}
              navigation={navigation}
            />
          </Wrapper>
        </WrapperVertical>
      </SafeAreaViewFlex>
    );
  }

  const listItem = savedCards
    .filter((savedCard: TCard) => {
      const serverCardType = cardTypeMap.get(savedCard.type);

      return serverCardType?.isVisible !== false;
    })
    .map((savedCard: TCard) => {
      const serverCardType = cardTypeMap.get(savedCard.type);
      const iconBackgroundColor =
        serverCardType?.iconBackgroundColor ?? savedCard.iconBackgroundColor;
      const iconColor = serverCardType?.iconColor ?? savedCard.iconColor;

      return {
        id: savedCard.cardNumber,
        leftIcon: (
          <Wrapper style={[styles.iconContainer, { backgroundColor: iconBackgroundColor }]}>
            <Icon.NamedIcon name={savedCard.iconName} color={iconColor} />
          </Wrapper>
        ),
        params: { savedCard, serverCardType, title: texts.screenTitles.wallet.detail },
        routeName: ScreenName.WalletCardDetail,
        subtitle: savedCard.description,
        title: savedCard.cardName || savedCard.title
      };
    });

  return (
    <WalletList
      contentContainerStyle={listContentContainerStyle}
      items={listItem}
      ListFooterComponent={() => (
        <WrapperVertical>
          <Footer
            buttonText={buttonText}
            infoIcon={infoIcon}
            infoText={infoText}
            navigation={navigation}
          />
        </WrapperVertical>
      )}
    />
  );
};

const createStyles = (colors) => ({
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
