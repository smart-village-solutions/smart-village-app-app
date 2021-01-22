import React from 'react';
import { NavigationScreenProp } from 'react-navigation';
import { texts } from '../../../config';

import { PaperPreviewData } from '../../../types';
import { RegularText } from '../../Text';
import { OParlItemPreview } from './OParlItemPreview';

type Props = { navigation: NavigationScreenProp<never> } & PaperPreviewData;

export const PaperPreview = ({ id, deleted, name, navigation, reference }: Props) => {
  return (
    <OParlItemPreview id={id} navigation={navigation}>
      <RegularText numberOfLines={1} primary lineThrough={deleted}>
        {name || reference || texts.oparl.paper.paper}
      </RegularText>
    </OParlItemPreview>
  );
};
