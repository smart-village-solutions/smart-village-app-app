import React, { useCallback } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Divider } from 'react-native-elements';
import { NavigationScreenProp } from 'react-navigation';

import { colors, normalize, texts } from '../../config';
import { formatAddress, openLink, shareMessage } from '../../helpers';
import { location, phone as phoneIcon } from '../../icons';
import { QUERY_TYPES } from '../../queries';
import { Icon } from '../Icon';
import { Logo } from '../Logo';
import { BoldText, RegularText } from '../Text';
import { InfoBox, Wrapper } from '../Wrapper';

type Props = {
  lunchOffers: { name: string; price: string }[];
  navigation: NavigationScreenProp<never>;
};

const data = {
  __typename: 'PointOfInterest',
  addresses: [
    {
      __typename: 'Address',
      city: 'Bad Belzig',
      geoLocation: {
        __typename: 'GeoLocation',
        latitude: 52.136268226788,
        longitude: 12.595159112766
      },
      kind: 'default',
      street: 'Am Bahnhof 11',
      zip: '14806'
    }
  ],
  category: {
    __typename: 'Category',
    name: 'Gastronomie'
  },
  contact: {
    __typename: 'Contact',
    email: 'info@flaeming-bahnhof.de',
    lastName: null,
    phone: '033841-798553'
  },
  description:
    '<div class="text">Belegte Brötchen, selbst gebackener Kuchen und ein warmes Tagesgericht - der Fläming-Bahnhof Bad Belzig versorgt nicht nur Zugreisende mit Leckereien. Hausgeschlachtete Wurstprodukte im Glas und weitere regionale Spezialitäten gibt es auch zum Mitnehmen im Shopbereich.</div>',
  id: '62',
  mediaContents: [
    {
      __typename: 'MediaContent',
      captionText: 'Bistro im Fläming-Bahnhof, Foto: Bansen/Wittig',
      contentType: 'thumbnail',
      copyright: null,
      sourceUrl: {
        __typename: 'WebUrl',
        url: 'http://backoffice2.reiseland-brandenburg.de/rpcServer/file/get/id/342310'
      }
    },
    {
      __typename: 'MediaContent',
      captionText: 'Fläming-Bahnhof Bad Belzig, Foto: Bansen/Wittig',
      contentType: 'image',
      copyright: null,
      sourceUrl: {
        __typename: 'WebUrl',
        url: 'http://backoffice2.reiseland-brandenburg.de/rpcServer/file/get/id/239225'
      }
    },
    {
      __typename: 'MediaContent',
      captionText: 'Regionale Produkte im Fläming-Bahnhof, Foto: Bansen/Wittig',
      contentType: 'image',
      copyright: null,
      sourceUrl: {
        __typename: 'WebUrl',
        url: 'http://backoffice2.reiseland-brandenburg.de/rpcServer/file/get/id/239226'
      }
    },
    {
      __typename: 'MediaContent',
      captionText: 'Am Bahnhof starten verschiedene Wanderwege, Foto: Bansen/Wittig',
      contentType: 'image',
      copyright: null,
      sourceUrl: {
        __typename: 'WebUrl',
        url: 'http://backoffice2.reiseland-brandenburg.de/rpcServer/file/get/id/239227'
      }
    },
    {
      __typename: 'MediaContent',
      captionText: 'Vor dem Bahnhof fährt die Burgenlinie, Foto: Bansen/Wittig',
      contentType: 'image',
      copyright: null,
      sourceUrl: {
        __typename: 'WebUrl',
        url: 'http://backoffice2.reiseland-brandenburg.de/rpcServer/file/get/id/239228'
      }
    }
  ],
  name: 'Bistro im Fläming-Bahnhof Bad Belzig',
  title: 'Bistro im Fläming-Bahnhof Bad Belzig',
  webUrls: []
};

const lunchOffersDummy = [
  { name: 'Tasty Burger', price: '2 EUR' },
  { name: 'Very Tasty Burger', price: '3 EUR' },
  { name: 'Immeasurably Tasty Burger', price: '5 EUR' },
  { name: 'Best Day of Your Life Burger', price: '7 EUR' }
];

const LunchOffer = ({ name, price }: { name: string; price: string }) => (
  <View style={styles.container}>
    <View style={styles.nameContainer}>
      <RegularText accessibilityLabel={`Mittagstisch (Gerichtname): ${name}`}>{name}</RegularText>
    </View>
    <View style={styles.priceContainer}>
      <RegularText accessibilityLabel={`Preis (${name}): ${price}`}>{price}</RegularText>
    </View>
  </View>
);

export const LunchSection = ({ lunchOffers = lunchOffersDummy, navigation }: Props) => {
  const { addresses, contact, contacts, dataProvider, title } = data;

  const onPress = useCallback(
    () =>
      navigation.navigate({
        routeName: 'Detail',
        params: {
          title: texts.detailTitles.pointOfInterest,
          query: QUERY_TYPES.POINT_OF_INTEREST,
          queryVariables: { id: `${data.id}` },
          shareContent: {
            message: shareMessage(data, QUERY_TYPES.POINT_OF_INTEREST)
          },
          details: {
            ...data,
            title: data.name
          }
        }
      }),
    [navigation]
  );

  if (!lunchOffers.length) {
    return null;
  }

  const address = formatAddress(addresses.find((address) => address.kind === 'default'));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const phone = contact?.phone ?? contacts?.find((item: any) => !!item.phone);

  return (
    <Wrapper>
      {!!dataProvider?.logo?.url && <Logo source={{ uri: dataProvider.logo.url }} />}
      {(!!address || !!title) && (
        <TouchableOpacity accessibilityLabel="Anbieterinformationen (Taste)" onPress={onPress}>
          <InfoBox style={styles.addressContainer}>
            <Icon xml={location(colors.primary)} style={styles.margin} />
            <View style={styles.address}>
              {!!title && <BoldText primary>{title}</BoldText>}
              {!!address && <RegularText primary>{address}</RegularText>}
            </View>
          </InfoBox>
        </TouchableOpacity>
      )}
      {!!phone && (
        <TouchableOpacity onPress={() => openLink(`tel:${phone}`)}>
          <InfoBox>
            <Icon xml={phoneIcon(colors.primary)} style={styles.margin} />
            <RegularText
              primary
              accessibilityLabel={`(Telefonnummer) ${phone} (Taste) (Wechselt zur Telefon-App)`}
            >
              {contact.phone}
            </RegularText>
          </InfoBox>
        </TouchableOpacity>
      )}
      <RegularText />
      <Divider style={styles.divider} />
      {lunchOffers.map((item, index) => (
        <LunchOffer key={index} name={item.name} price={item.price} />
      ))}
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  address: {
    flexDirection: 'column'
  },
  addressContainer: {
    alignItems: 'center'
  },
  container: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.darkText
  },
  divider: {
    backgroundColor: colors.darkText
  },
  margin: {
    marginRight: normalize(10)
  },
  nameContainer: {
    flexShrink: 1
  },
  priceContainer: {
    marginLeft: normalize(14)
  }
});
