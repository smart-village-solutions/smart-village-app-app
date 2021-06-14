import React from 'react';

import { texts } from '../../../config';
import { SimpleRow } from '../Row';

type Props = {
  contactEmail?: string;
  contactName?: string;
};

const { contactSection: sectionTexts } = texts.oparl;

export const ContactSection = ({ contactEmail, contactName }: Props) => {
  return (
    <>
      <SimpleRow left={sectionTexts.name} right={contactName} />
      <SimpleRow left={sectionTexts.email} right={contactEmail} fullText selectable />
    </>
  );
};
