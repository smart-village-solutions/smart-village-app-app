import { PersonPreviewData } from '../types';

export const getFullName = (defaultString: string, person?: PersonPreviewData) => {
  if (!person) return defaultString;

  if (person.name) return person.name;

  const { affix, familyName, formOfAddress, givenName, title } = person;
  const affixString = affix?.length ? `(${affix})` : undefined;

  const titleString = title?.filter((item) => !!item?.length).join(' ');

  return [formOfAddress, titleString, givenName, familyName, affixString]
    .filter((item) => !!item?.length)
    .join(' ');
};
