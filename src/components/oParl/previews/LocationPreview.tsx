import React from 'react';
import { NavigationScreenProp } from 'react-navigation';

import { texts } from '../../../config';
import { LocationPreviewData } from '../../../types';
import { OParlPreviewEntry } from './OParlPreviewEntry';

type Props = {
  data: LocationPreviewData;
  navigation: NavigationScreenProp<never>;
};

export const LocationPreview = ({ data, navigation }: Props) => {
  const { id, type, locality, room, streetAddress, subLocality } = data;

  let localityString = texts.oparl.location.location;

  if (locality?.length) {
    localityString = subLocality?.length ? `${locality} (${subLocality})` : locality;
  }

  const addressString = streetAddress?.length ? streetAddress : localityString;

  const title = addressString + (room?.length ? `(${room})` : '');

  return <OParlPreviewEntry id={id} type={type} title={title} navigation={navigation} />;
};
