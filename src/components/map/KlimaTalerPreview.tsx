import React, { useState, useSyncExternalStore } from 'react';
import { StyleSheet, View } from 'react-native';

import { Icon } from '../../config/icons/Icon';
import { texts } from '../../config/texts';
import { useTheme } from '../../hooks/useTheme';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import type { KlimaTalerOfferLocation } from '../../klimaTaler/offersTypes';
import { klimaTalerEntry, openKlimaTaler } from '../../klimaTaler/entry';
import type { ThemeColorPalette } from '../../types/Theme';
import { Text } from '../Text';
import { TextListItem } from '../TextListItem';

import { MapPreview } from './MapPreview';

const getPreviewImage = (location: KlimaTalerOfferLocation) =>
  (location.offers.length === 1 && location.offers[0].image) || location.image;

export const KlimaTalerPreview = ({
  location,
  navigation,
  stale = false
}: {
  location: KlimaTalerOfferLocation;
  stale?: boolean;
  navigation: React.ComponentProps<typeof MapPreview>['navigation'];
}) => {
  const [expanded, setExpanded] = useState(false);
  const entry = useSyncExternalStore(klimaTalerEntry.subscribe, klimaTalerEntry.getSnapshot);
  const opening = entry.phase === 'opening';
  const styles = useThemeStyles(createStyles);
  const { colors } = useTheme();
  const copy = texts.klimaTaler.map;
  const subtitle = location.offers.map((offer) => offer.title).join(' · ');
  const singleOffer = location.offers.length === 1 ? location.offers[0] : undefined;
  const targetLabel = singleOffer ? copy.openOffer : copy.chooseOffer;
  const accessibilityLabel = opening
    ? texts.klimaTaler.opening
    : `${location.name}, ${targetLabel}`;
  const image = getPreviewImage(location);
  const offerSubtitle = (offer: KlimaTalerOfferLocation['offers'][number]) =>
    `${offer.cost.toLocaleString('de-DE')} Klima-Taler · ${
      offer.remaining > 10 ? '10+' : offer.remaining.toLocaleString('de-DE')
    } ${copy.available}`;
  const open = (offerId: number) => {
    if (!opening) void openKlimaTaler(offerId);
  };
  return (
    <MapPreview
      navigation={navigation}
      disabled={opening}
      item={{
        id: String(location.id),
        title: location.name,
        subtitle: singleOffer ? `${singleOffer.title}\n${offerSubtitle(singleOffer)}` : subtitle,
        overtitle: 'Klima-Taler',
        bottomDivider: false,
        params: {},
        routeName: '',
        accessibilityLabel,
        picture: image ? { url: image } : undefined,
        leftIcon: image ? undefined : (
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
    >
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
            <TextListItem
              key={offer.id}
              navigation={navigation}
              disabled={opening}
              leftImage={!!offer.image}
              listsWithoutArrows
              containerStyle={styles.offer}
              item={{
                id: String(offer.id),
                title: offer.title,
                subtitle: offerSubtitle(offer),
                picture: offer.image ? { url: offer.image } : undefined,
                accessibilityLabel: `${offer.title}, ${offerSubtitle(offer)}, ${copy.openOffer}`,
                params: {},
                routeName: '',
                bottomDivider: false,
                onPress: () => open(offer.id)
              }}
            />
          ))}
        </View>
      )}
    </MapPreview>
  );
};

// Dynamic theme styles are consumed through useThemeStyles.
/* eslint-disable react-native/no-unused-styles */
const createStyles = (colors: ThemeColorPalette) =>
  StyleSheet.create({
    icon: { width: 64, height: 64, alignItems: 'center', justifyContent: 'center' },
    details: { gap: 12 },
    status: { color: colors.text, paddingTop: 12 },
    description: { color: colors.text, fontSize: 14, lineHeight: 21 },
    offer: {
      borderTopWidth: 1,
      borderColor: colors.border,
      paddingVertical: 12,
      minHeight: 48,
      paddingHorizontal: 0
    }
  });
