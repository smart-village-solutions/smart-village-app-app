import React, { useState, useSyncExternalStore } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Icon } from '../../config/icons/Icon';
import { texts } from '../../config/texts';
import { useTheme } from '../../hooks/useTheme';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import type { KlimaTalerOfferLocation } from '../../klimaTaler/offersTypes';
import { klimaTalerEntry, openKlimaTaler } from '../../klimaTaler/entry';
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
  const entry = useSyncExternalStore(klimaTalerEntry.subscribe, klimaTalerEntry.getSnapshot);
  const opening = entry.phase === 'opening';
  const styles = useThemeStyles(createStyles);
  const { colors } = useTheme();
  const copy = texts.klimaTaler.map;
  const subtitle = location.offers.map((offer) => offer.title).join(' · ');
  const singleOffer = location.offers.length === 1 ? location.offers[0] : undefined;
  const open = (offerId: number) => {
    if (!opening) void openKlimaTaler(offerId);
  };
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
          accessibilityLabel: opening
            ? texts.klimaTaler.opening
            : `${location.name}, ${singleOffer ? copy.openOffer : copy.chooseOffer}`,
          picture: location.image ? { url: location.image } : undefined,
          leftIcon: location.image ? undefined : (
            <View style={styles.icon}>
              <Icon.NamedIcon name="leaf" color={colors.primary} />
            </View>
          ),
          onPress: () => {
            if (opening) return;
            if (singleOffer) open(singleOffer.id);
            else setExpanded((value) => !value);
          }
        }}
      />
      {opening && (
        <Text italic={false} style={styles.status} accessibilityLiveRegion="polite">
          {texts.klimaTaler.opening}
        </Text>
      )}
      {stale && (
        <Text italic={false} style={styles.status} accessibilityLiveRegion="polite">
          {copy.stale}
        </Text>
      )}
      {expanded && !singleOffer && (
        <View style={styles.details}>
          <Text italic={false} style={styles.description}>
            {copy.chooseOffer}
          </Text>
          {location.offers.map((offer) => (
            <Pressable
              key={offer.id}
              accessibilityRole="button"
              accessibilityLabel={`${offer.title}, ${copy.openOffer}`}
              accessibilityState={{ disabled: opening, busy: opening }}
              disabled={opening}
              onPress={() => open(offer.id)}
              style={styles.offer}
            >
              <Text italic={false} style={styles.title}>
                {offer.title}
              </Text>
              <Text italic={false} style={styles.description}>{`${offer.cost.toLocaleString(
                'de-DE'
              )} Klima-Taler · ${offer.remaining.toLocaleString('de-DE')} ${copy.available}`}</Text>
            </Pressable>
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
    status: { color: colors.text, padding: 12 },
    description: { color: colors.text, fontSize: 14, lineHeight: 21 },
    offer: {
      borderTopWidth: 1,
      borderColor: colors.border,
      paddingVertical: 12,
      minHeight: 48,
      gap: 6
    },
    title: { color: colors.text, fontFamily: 'bold', fontSize: 16, lineHeight: 22 }
  });
