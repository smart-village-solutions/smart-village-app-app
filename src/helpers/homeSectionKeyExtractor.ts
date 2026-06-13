type HomeSection = {
  categoriesNews?: Array<{
    categoryId?: number | string;
    categoryTitle?: string;
  }>;
  query?: string;
  title?: string;
  type?: string;
};

const normalizeKeyPart = (value: unknown) =>
  String(value ?? '')
    .trim()
    .replace(/\s+/g, '-');

export const homeSectionKeyExtractor = (item: HomeSection, index: number) => {
  if (item.type) {
    return `home-section-type-${normalizeKeyPart(item.type)}`;
  }

  if (item.categoriesNews?.length) {
    const categoryKey = item.categoriesNews
      .map((category) => normalizeKeyPart(category.categoryId ?? category.categoryTitle))
      .join('-');

    return `home-section-categories-${categoryKey}`;
  }

  if (item.query) {
    return `home-section-query-${normalizeKeyPart(item.query)}-title-${normalizeKeyPart(
      item.title
    )}`;
  }

  return `home-section-${index}`;
};
