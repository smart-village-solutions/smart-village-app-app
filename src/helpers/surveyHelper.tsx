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
