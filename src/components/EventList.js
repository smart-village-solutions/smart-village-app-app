import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { SectionList, StyleSheet } from 'react-native';

import { consts, texts } from '../config';
import { momentFormat } from '../helpers';
import { useRenderItem } from '../hooks';
import { QUERY_TYPES } from '../queries';
import { ScreenName } from '../types';

import { LoadingSpinner } from './LoadingSpinner';
import { SectionHeader } from './SectionHeader';

const keyExtractor = (item, index) => `index${index}-id${item.id}`;

const MAX_INITIAL_NUM_TO_RENDER = 20;
const { ROOT_ROUTE_NAMES } = consts;

export const EventList = ({
  data,
  fetchMoreData,
  ListEmptyComponent,
  ListHeaderComponent,
  navigation,
  noSubtitle,
  query,
  queryVariables,
  refreshControl
}) => {
  const [listEndReached, setListEndReached] = useState(false);

  const onEndReached = async () => {
    if (fetchMoreData) {
      // if there is a pagination, the end of the list is reached, when no more data is returned
      // from partially fetching, so we need to check the the data to determine the lists end
      const { data: moreData } = await fetchMoreData();

      setListEndReached(!moreData[QUERY_TYPES.EVENT_RECORDS].length);
    } else {
      setListEndReached(true);
    }
  };

  const renderItem = useRenderItem(QUERY_TYPES.EVENT_RECORDS, navigation, { noSubtitle });
  const sectionedData = data?.reduce((previous, current) => {
    const listDate = current?.params?.details?.listDate || current?.listDate;

    if (listDate) {
      if (previous[previous?.length - 1]?.title === listDate) {
        previous[previous.length - 1].data.push(current);
      } else {
        previous.push({ title: listDate, data: [current] });
      }
    }

    return previous;
  }, []);

  return (
    <SectionList
      initialNumToRender={MAX_INITIAL_NUM_TO_RENDER}
      keyExtractor={keyExtractor}
      ListFooterComponent={() => {
        if (data?.length >= MAX_INITIAL_NUM_TO_RENDER) {
          return <LoadingSpinner loading={!listEndReached} />;
        }

        return null;
      }}
      ListEmptyComponent={ListEmptyComponent}
      ListHeaderComponent={ListHeaderComponent}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      refreshControl={refreshControl}
      renderItem={renderItem}
      renderSectionHeader={({ section: { title } }) => (
        <SectionHeader
          title={momentFormat(title, 'DD.MM.YYYY dddd')}
          onPress={
            query === QUERY_TYPES.EVENT_RECORDS
              ? () =>
                  navigation.push(ScreenName.Index, {
                    title: texts.homeTitles.events,
                    query,
                    queryVariables: {
                      ...queryVariables,
                      dateRange: [
                        momentFormat(title, 'YYYY-MM-DD'),
                        momentFormat(title, 'YYYY-MM-DD')
                      ]
                    },
                    rootRouteName: ROOT_ROUTE_NAMES.EVENT_RECORDS,
                    showFilterByDailyEvents: false
                  })
              : undefined
          }
        />
      )}
      sections={sectionedData}
      stickySectionHeadersEnabled
      contentContainerStyle={styles.contentContainerStyle}
    />
  );
};

const styles = StyleSheet.create({
  contentContainerStyle: {
    flexGrow: 1
  }
});

EventList.propTypes = {
  data: PropTypes.array,
  fetchMoreData: PropTypes.func,
  ListEmptyComponent: PropTypes.object,
  ListHeaderComponent: PropTypes.object,
  navigation: PropTypes.object,
  noSubtitle: PropTypes.bool,
  query: PropTypes.string,
  queryVariables: PropTypes.object,
  refreshControl: PropTypes.object
};
