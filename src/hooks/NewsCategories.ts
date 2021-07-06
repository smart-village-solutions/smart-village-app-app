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
    categoryTitle?: string;
    categoryTitleDetail?: string;
    categoryButton?: string;
    categoryId?: string;
  }>;
};
