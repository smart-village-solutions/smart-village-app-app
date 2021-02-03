import React from 'react';

import { texts } from '../../../config';
import { LineEntry } from '../LineEntry';

export const KeywordSection = ({ keyword }: { keyword?: string[] }) => {
  if (!keyword || !keyword.length) {
    return null;
  }

  const keywordString = keyword.join(', ');

  return <LineEntry fullText left={texts.oparl.keywords} right={keywordString} />;
};
