import { useContext } from 'react';

import { texts } from '../config';
import { SettingsContext } from '../SettingsProvider';

export const useNewsCategories = () => {
  const { globalSettings } = useContext(SettingsContext);
  const { sections = {} } = globalSettings;
  const {
    categoriesNews = [
      {
        categoryTitle: texts.homeCategoriesNews.categoryTitle,
        categoryTitleDetail: texts.homeCategoriesNews.categoryTitleDetail,
        categoryButton: texts.homeButtons.news
      }
    ]
  } = sections;

  return categoriesNews as Array<{
    categoryButton?: string;
    categoryId?: string | number;
    categoryTitle?: string;
    categoryTitleDetail?: string;
    indexCategoryIds?: (string | number)[];
    parentCategoryId?: string | number;
  }>;
};
