import { texts } from '../config';

export const combineLanguages = (
  languages: string[],
  localeObj?: Record<string, string | undefined>
) => {
  if (!localeObj) {
    return;
  }

  return languages
    .map((language) => localeObj?.[language])
    .filter((langTitle) => langTitle?.length)
    .join(' / ');
};

export const getAnswerLabel = (lang: 'de' | 'pl', index: number) => {
  return `${texts.survey.answerLabelPrefix[lang]} ${String.fromCharCode(65 + index)}:`;
};
