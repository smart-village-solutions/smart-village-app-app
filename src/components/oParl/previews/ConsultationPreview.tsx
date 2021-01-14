import React from 'react';
import { NavigationScreenProp } from 'react-navigation';
import { texts } from '../../../config';
import { ConsultationPreviewData } from '../../../types';
import { RegularText } from '../../Text';
import { OParlItemPreview } from './OParlItemPreview';

type Props = {
  navigation: NavigationScreenProp<never>;
  withAgendaItem?: boolean;
} & ConsultationPreviewData;

// withAgendaItem === true means that it is shown as part of a paper
// and we want to give information about the corresponding agendaItem in the preview
// withAgendaItem === false means the opposite, so we want to show the information of the paper
export const ConsultationPreview = ({
  id,
  agendaItem,
  meeting,
  navigation,
  paper,
  withAgendaItem
}: Props) => {
  const agendaItemText = agendaItem?.name ?? agendaItem?.name ?? texts.oparl.agendaItem.agendaItem;

  const textWithAgendaItem = meeting?.name ? `${meeting.name}: ${agendaItemText}` : agendaItemText;
  const textWithPaper = paper?.name ?? paper?.reference ?? texts.oparl.paper.paper;

  return (
    <OParlItemPreview id={id} navigation={navigation}>
      {withAgendaItem ? (
        <RegularText lineThrough={meeting?.cancelled} numberOfLines={1} primary>
          {textWithAgendaItem}
        </RegularText>
      ) : (
        <RegularText primary>{textWithPaper}</RegularText>
      )}
    </OParlItemPreview>
  );
};
