import React from 'react';
import { NavigationScreenProp } from 'react-navigation';

import { texts } from '../../../config';
import { ConsultationPreviewData } from '../../../types';
import { RegularText } from '../../Text';
import { OParlPreviewWrapper } from './OParlPreviewWrapper';

type Props = {
  data: ConsultationPreviewData;
  navigation: NavigationScreenProp<never>;
  withAgendaItem?: boolean;
};

// withAgendaItem === true means that it is shown as part of a paper
// and we want to give information about the corresponding agendaItem in the preview
// withAgendaItem === false means the opposite, so we want to show the information of the paper
export const ConsultationPreview = ({ data, navigation, withAgendaItem }: Props) => {
  const { id, agendaItem, deleted, meeting, paper } = data;

  const agendaItemText = agendaItem?.name ?? agendaItem?.name ?? texts.oparl.agendaItem.agendaItem;

  const textWithAgendaItem = meeting?.name ? `${meeting.name}: ${agendaItemText}` : agendaItemText;
  const textWithPaper = paper?.name ?? paper?.reference ?? texts.oparl.paper.paper;

  return (
    <OParlPreviewWrapper id={id} navigation={navigation}>
      {withAgendaItem ? (
        <RegularText lineThrough={meeting?.cancelled || deleted} numberOfLines={1} primary>
          {textWithAgendaItem}
        </RegularText>
      ) : (
        <RegularText lineThrough={deleted} primary>
          {textWithPaper}
        </RegularText>
      )}
    </OParlPreviewWrapper>
  );
};
