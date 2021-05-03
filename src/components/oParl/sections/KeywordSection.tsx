import React from 'react';

import { texts } from '../../../config';
import { SimpleRow } from '../Row';

export const KeywordSection = ({ keyword }: { keyword?: string[] }) => {
  if (!keyword?.length) {
    return null;
  }

  const keywordString = keyword.join(', ');

  return <SimpleRow left={texts.oparl.keywords} right={keywordString} fullText />;
};
