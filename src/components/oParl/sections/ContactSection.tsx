import React from 'react';
import { texts } from '../../../config';
import { LineEntry } from '../LineEntry';

type Props = {
  contactEmail?: string;
  contactName?: string;
};

const { contactSection: sectionTexts } = texts.oparl;

export const ContactSection = ({ contactEmail, contactName }: Props) => {
  return (
    <>
      <LineEntry left={sectionTexts.name} right={contactName} />
      <LineEntry fullText left={sectionTexts.email} right={contactEmail} selectable />
    </>
  );
};
