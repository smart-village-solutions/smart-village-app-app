import React from 'react';
import { NavigationScreenProp } from 'react-navigation';

import { texts } from '../../../config';
import { SystemPreviewData } from '../../../types';
import { RegularText } from '../../Text';
import { OParlItemPreview } from './OParlItemPreview';

type Props = {
  data: SystemPreviewData;
  navigation: NavigationScreenProp<never>;
};

export const SystemPreview = ({ data, navigation }: Props) => {
  const { id, deleted, name, oparlVersion } = data;

  return (
    <OParlItemPreview id={id} navigation={navigation}>
      <RegularText numberOfLines={1} primary lineThrough={deleted}>
        {name || texts.oparl.system.system}
      </RegularText>
      {!!oparlVersion && <RegularText numberOfLines={1}>{`(${oparlVersion})`}</RegularText>}
    </OParlItemPreview>
  );
};
