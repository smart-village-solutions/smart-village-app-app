import React from 'react';
import { NavigationScreenProp } from 'react-navigation';

import { texts } from '../../../config';
import { momentFormat } from '../../../helpers';
import { AgendaItemPreviewData } from '../../../types';

import { RegularText } from '../../Text';
import { WrapperRow } from '../../Wrapper';
import { OParlItemPreview } from './OParlItemPreview';

type Props = {
  data: AgendaItemPreviewData;
  navigation: NavigationScreenProp<never>;
  withNumberAndTime?: boolean;
};

export const AgendaItemPreview = ({ data, navigation, withNumberAndTime }: Props) => {
  const { id, name, number, start } = data;

  const formatString = withNumberAndTime ? 'HH:mm' : 'DD.MM.YYYY';

  const dateString = start ? momentFormat(start.valueOf(), formatString, 'x') : '';

  return (
    <OParlItemPreview id={id} navigation={navigation}>
      <WrapperRow>
        {withNumberAndTime && !!number && <RegularText>{number}</RegularText>}
        <RegularText numberOfLines={1} primary>
          {name?.length ? name : texts.oparl.agendaItem.agendaItem}
        </RegularText>
      </WrapperRow>
      <RegularText>{dateString}</RegularText>
    </OParlItemPreview>
  );
};
