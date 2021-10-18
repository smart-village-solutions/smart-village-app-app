import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { SectionList } from 'react-native';

import { momentFormat } from '../helpers';
import { useRenderItem } from '../hooks/listHooks';
import { QUERY_TYPES } from '../queries';

import { LoadingSpinner } from './LoadingSpinner';
import { SectionHeader } from './SectionHeader';

const keyExtractor = (item, index) => `index${index}-id${item.id}`;

export const EventList = ({
  data,
  fetchMoreData,
  ListHeaderComponent,
  navigation,
  noSubtitle,
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

  const renderItem = useCallback(useRenderItem(QUERY_TYPES.EVENT_RECORDS, navigation, noSubtitle), [
    navigation,
    noSubtitle
  ]);

  const sectionedData = data.reduce((previous, current) => {
    if (previous[previous?.length - 1]?.title === current.params.details.listDate) {
      previous[previous.length - 1].data.push(current);
      return previous;
    } else {
      previous.push({ title: current.params.details.listDate, data: [current] });
      return previous;
    }
  }, []);

  return (
    <SectionList
      initialNumToRender={data.length < 20 ? data.length : 20}
      keyExtractor={keyExtractor}
      ListFooterComponent={() => {
        if (data.length > 10) {
          return <LoadingSpinner loading={!listEndReached} />;
        }

        return null;
      }}
      ListHeaderComponent={ListHeaderComponent}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      refreshControl={refreshControl}
      renderItem={renderItem}
      renderSectionHeader={({ section: { title } }) => (
        <SectionHeader title={momentFormat(title)} />
      )}
      sections={sectionedData}
      stickySectionHeadersEnabled
    />
  );
};

EventList.propTypes = {
  data: PropTypes.array,
  fetchMoreData: PropTypes.func,
  ListHeaderComponent: PropTypes.object,
  navigation: PropTypes.object,
  noSubtitle: PropTypes.bool,
  refreshControl: PropTypes.object
};
