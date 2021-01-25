import React from 'react';
import { NavigationScreenProp } from 'react-navigation';

import { texts } from '../../../config';
import { LocationPreviewData } from '../../../types';
import { RegularText } from '../../Text';
import { OParlItemPreview } from './OParlItemPreview';

type Props = {
  data: LocationPreviewData;
  navigation: NavigationScreenProp<never>;
};

export const LocationPreview = ({ data, navigation }: Props) => {
  const { deleted, id, locality, room, streetAddress, subLocality } = data;

  let localityString = texts.oparl.location.location;

  if (locality?.length) {
    localityString = subLocality?.length ? `${locality} (${subLocality})` : locality;
  }

  const addressString = streetAddress?.length ? streetAddress : localityString;

  return (
    <OParlItemPreview id={id} navigation={navigation}>
      <RegularText numberOfLines={1} primary lineThrough={deleted}>
        {addressString}
      </RegularText>
      {!!room?.length && <RegularText primary>{`(${room})`}</RegularText>}
    </OParlItemPreview>
  );
};
