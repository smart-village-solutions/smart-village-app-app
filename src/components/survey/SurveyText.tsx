import React from 'react';

import { HtmlView } from '../HtmlView';
import { RegularText } from '../Text';
import { containsHtml } from '../../helpers';

type Props = {
  content?: string;
  italic?: boolean;
  width?: number;
};

export const SurveyText = ({ content, italic, width }: Props) => {
  if (!content?.length) {
    return null;
  }

  return containsHtml(content) ? (
    // @ts-expect-error HTMLView uses memo, which is a generic type (used in js), which causes issues with type inference
    <HtmlView html={content} width={width} />
  ) : (
    <RegularText italic={italic}>{content}</RegularText>
  );
};
