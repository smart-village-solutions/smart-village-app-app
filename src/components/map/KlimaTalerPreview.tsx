import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Icon } from '../../config/icons/Icon';
import { texts } from '../../config/texts';
import { useTheme } from '../../hooks/useTheme';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import type { KlimaTalerOfferLocation } from '../../klimaTaler/offersTypes';
import type { ThemeColorPalette } from '../../types/Theme';
import { Text } from '../Text';
import { TextListItem } from '../TextListItem';

export const KlimaTalerPreview = ({
  location,
  navigation,
  stale = false
}: {
  location: KlimaTalerOfferLocation;
  stale?: boolean;
  navigation: React.ComponentProps<typeof TextListItem>['navigation'];
}) => {
  const [expanded, setExpanded] = useState(false);
  const styles = useThemeStyles(createStyles);
  const { colors } = useTheme();
  const copy = texts.klimaTaler.map;
  const address = [location.address, location.postal_code, location.city].filter(Boolean).join(' ');
  const subtitle = location.offers.map((offer) => offer.title).join(' · ');
  return (
    <ScrollView style={styles.preview} nestedScrollEnabled>
      <TextListItem
        navigation={navigation}
        leftImage={!!location.image}
        listsWithoutArrows
        containerStyle={styles.row}
        item={{
          id: String(location.id),
          title: location.name,
          subtitle,
          overtitle: 'Klima-Taler',
          bottomDivider: false,
          params: {},
          routeName: '',
          accessibilityLabel: `${location.name}, ${copy.showOffers}`,
          picture: location.image ? { url: location.image } : undefined,
          leftIcon: location.image ? undefined : (
            <View style={styles.icon}>
              <Icon.NamedIcon name="leaf" color={colors.primary} />
            </View>
          ),
          onPress: () => setExpanded((value) => !value)
        }}
      />
      {expanded && (
        <View style={styles.details}>
          {!!address && (
            <Text italic={false} style={styles.description}>
              {address}
            </Text>
          )}
          {stale && (
            <Text italic={false} style={styles.description} accessibilityLiveRegion="polite">
              {copy.stale}
            </Text>
          )}
          {location.offers.map((offer) => (
            <View key={offer.id} style={styles.offer}>
              <Text italic={false} style={styles.title}>
                {offer.title}
              </Text>
              <Text italic={false} style={styles.description}>{`${offer.cost.toLocaleString(
                'de-DE'
              )} Klima-Taler · ${offer.remaining.toLocaleString('de-DE')} ${copy.available}`}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

// Dynamic theme styles are consumed through useThemeStyles.
/* eslint-disable react-native/no-unused-styles */
const createStyles = (colors: ThemeColorPalette) =>
  StyleSheet.create({
    preview: { maxHeight: 300, backgroundColor: colors.surface, borderRadius: 8 },
    row: { padding: 8 },
    icon: { width: 64, height: 64, alignItems: 'center', justifyContent: 'center' },
    details: { padding: 12, gap: 12 },
    description: { color: colors.text, fontSize: 14, lineHeight: 21 },
    offer: { borderTopWidth: 1, borderColor: colors.border, paddingTop: 12, gap: 6 },
    title: { color: colors.text, fontFamily: 'bold', fontSize: 16, lineHeight: 22 }
  });
