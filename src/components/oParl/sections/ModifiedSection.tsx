import React from 'react';
import { texts } from '../../../config';
import { momentFormat } from '../../../helpers';
import { BoldText, RegularText } from '../../Text';
import { WrapperRow } from '../../Wrapper';

type Props = {
  created?: Date;
  modified?: Date;
  deleted?: boolean;
};

const { modifiedSection } = texts.oparl;

const formatDate = (date: Date) => momentFormat(date.valueOf(), 'DD.MM.YYYY HH:mm:ss Uhr', 'x');

export const ModifiedSection = ({ created, modified, deleted }: Props) => {
  if (!created && !modified) {
    return null;
  }

  return (
    <>
      {!!created && (
        <WrapperRow>
          <BoldText>{modifiedSection.created}</BoldText>
          <RegularText>{formatDate(created)}</RegularText>
        </WrapperRow>
      )}
      {!!modified && (
        <WrapperRow>
          <BoldText>{modifiedSection.modified}</BoldText>
          <RegularText>{formatDate(modified)}</RegularText>
        </WrapperRow>
      )}
      {deleted && <RegularText>{modifiedSection.deleted}</RegularText>}
    </>
  );
};
