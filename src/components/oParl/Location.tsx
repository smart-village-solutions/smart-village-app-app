import React from 'react';
import { MapMarker } from 'react-native-webview-leaflet';
import { NavigationScreenProp } from 'react-navigation';

import { colors, texts } from '../../config';
import { location, locationIconAnchor } from '../../icons';
import { isFeature, isFeatureCollection, isMultiPoint, isPoint } from '../../jsonValidation';
import { LocationData } from '../../types';
import { WebViewMap } from '../map';
import { BoldText, RegularText } from '../Text';
import { Wrapper } from '../Wrapper';
import { LineEntry } from './LineEntry';
import {
  KeywordSection,
  ModifiedSection,
  OParlPreviewSection,
  WebRepresentation
} from './sections';

type Props = {
  data: LocationData;
  navigation: NavigationScreenProp<never>;
};

const locationTexts = texts.oparl.location;

const getMapMarkers = (geoJson: unknown): MapMarker[] => {
  if (isPoint(geoJson) && geoJson.coordinates.length > 1) {
    return [
      {
        icon: location(colors.primary),
        iconAnchor: locationIconAnchor,
        position: {
          lat: geoJson.coordinates[1],
          lng: geoJson.coordinates[0]
        }
      }
    ];
  } else if (isMultiPoint(geoJson) && geoJson.coordinates.length) {
    const { coordinates } = geoJson;

    return coordinates
      .filter((entry) => entry.length > 1)
      .map((entry) => ({
        icon: location(colors.primary),
        iconAnchor: locationIconAnchor,
        position: {
          lat: entry[1],
          lng: entry[0]
        }
      }));
  } else if (isFeature(geoJson)) {
    return getMapMarkers(geoJson.geometry);
  } else if (isFeatureCollection(geoJson)) {
    return geoJson.features.reduce(
      (accumulated: MapMarker[], current) => accumulated.concat(getMapMarkers(current)),
      []
    );
  } else {
    return [];
  }
};

export const Location = ({ data, navigation }: Props) => {
  const {
    bodies,
    created,
    deleted,
    description,
    geoJson,
    keyword,
    locality,
    meeting,
    modified,
    organization,
    papers,
    postalCode,
    room,
    streetAddress,
    subLocality,
    web
  } = data;

  let localityString: string | undefined;

  if (locality) {
    if (subLocality) {
      localityString = `${locality} (${subLocality})`;
    } else {
      localityString = locality;
    }
  } else {
    localityString = subLocality;
  }

  const mapMarkers = getMapMarkers(geoJson);

  return (
    <Wrapper>
      {!!mapMarkers.length && <WebViewMap locations={mapMarkers} />}
      <>
        <BoldText>{locationTexts.streetAddress}</BoldText>
        <RegularText>{streetAddress}</RegularText>
      </>
      <LineEntry left={locationTexts.postalCode} right={postalCode} />
      <>
        <BoldText>{locationTexts.locality}</BoldText>
        <RegularText>{localityString}</RegularText>
      </>
      <LineEntry left={locationTexts.room} right={room} />
      <OParlPreviewSection data={meeting} header={locationTexts.meeting} navigation={navigation} />
      {!!description && (
        <>
          <BoldText>{locationTexts.description}</BoldText>
          <RegularText>{description}</RegularText>
        </>
      )}
      <OParlPreviewSection data={bodies} header={locationTexts.bodies} navigation={navigation} />
      <OParlPreviewSection
        data={organization}
        header={locationTexts.organization}
        navigation={navigation}
      />
      <OParlPreviewSection data={papers} header={locationTexts.papers} navigation={navigation} />
      <KeywordSection keyword={keyword} />
      <WebRepresentation name={locationTexts.location} navigation={navigation} web={web} />
      <ModifiedSection created={created} deleted={deleted} modified={modified} />
    </Wrapper>
  );
};
