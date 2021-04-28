import React from 'react';
import { NavigationScreenProp } from 'react-navigation';

import { texts } from '../../../config';
import { LocationPreviewData } from '../../../types';
import { RegularText } from '../../Text';
import { OParlPreviewEntry } from './OParlPreviewEntry';

type Props = {
  data: LocationPreviewData;
  navigation: NavigationScreenProp<never>;
};

export const FormattedLocation = ({ location }: { location: LocationPreviewData }) => {
  return (
    <>
      <RegularText>{location.streetAddress}</RegularText>
      <RegularText>
        {(location.postalCode ? location.postalCode + ' ' : '') + (location.locality ?? '')}
      </RegularText>
      {!!location.room && (
        <>
          <RegularText />
          <RegularText>{location.room}</RegularText>
        </>
      )}
    </>
  );
};

const getLocationPreviewText = (data: LocationPreviewData) => {
  const { locality, room, streetAddress, subLocality } = data;

  let localityString = texts.oparl.location.location;

  if (locality?.length) {
    localityString = subLocality?.length ? `${locality} (${subLocality})` : locality;
  }

  const addressString = streetAddress?.length ? streetAddress : localityString;

  return addressString + (room?.length ? `(${room})` : '');
};

export const LocationPreview = ({ data, navigation }: Props) => {
  const { id, type } = data;

  return (
    <OParlPreviewEntry
      id={id}
      type={type}
      title={getLocationPreviewText(data)}
      navigation={navigation}
      screenTitle={texts.oparl.location.location}
    />
  );
};
