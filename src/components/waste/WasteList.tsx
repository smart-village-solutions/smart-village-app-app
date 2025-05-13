import React, { useContext } from 'react';
import { StyleSheet } from 'react-native';

import { SettingsContext } from '../../SettingsProvider';
import { normalize } from '../../config';
import { FeedbackFooter } from '../FeedbackFooter';
import { ListComponent } from '../ListComponent';

type WasteListProps = {
  data: any[];
  ListHeaderComponent: JSX.Element;
  query: string;
  selectedTypes: Record<string, any>;
};

export const WasteList = ({ data, ListHeaderComponent, query, selectedTypes }: WasteListProps) => {
  const { globalSettings } = useContext(SettingsContext);
  const { settings = {} } = globalSettings;
  const { wasteAddresses = {} } = settings;
  const { hasExport = true, hasHeaderSearchBarOption = false } = wasteAddresses;

  const ListFooterComponent = !hasHeaderSearchBarOption ? (
    <FeedbackFooter
      containerStyle={[styles.feedbackContainer, hasExport && styles.feedbackContainerMarginBottom]}
    />
  ) : undefined;

  return (
    <ListComponent
      data={data}
      estimatedItemSize={data?.length * 2}
      ListFooterComponent={ListFooterComponent}
      ListHeaderComponent={ListHeaderComponent}
      query={query}
      queryVariables={{ usedTypes: selectedTypes, groupKey: 'listDate' }}
      sectionByDate
    />
  );
};

const styles = StyleSheet.create({
  feedbackContainer: {
    justifyContent: 'flex-end',
    marginTop: normalize(10)
  },
  feedbackContainerMarginBottom: {
    marginBottom: normalize(70)
  }
});
