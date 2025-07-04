import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import { FlatList } from 'react-native';

import { RegularText, SafeAreaViewFlex, Wrapper } from '../../components';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { OParlPreviewComponent } from '../../components/oParl';
import { texts } from '../../config';
import { useOParlQuery } from '../../hooks';
import { organizationListQuery } from '../../queries/OParl';
import { OrganizationPreviewData } from '../../types';

type Props = {
  navigation: StackNavigationProp<never>;
};

const pageSize = 30;

const [query, queryName] = organizationListQuery;

const useListData = (organizationData?: { [queryName]: OrganizationPreviewData[] }) => {
  const [listData, setListData] = useState<OrganizationPreviewData[]>([]);

  useEffect(() => {
    const organizations = organizationData?.[queryName] ?? [];
    setListData(organizations.filter((orga: OrganizationPreviewData) => !orga.deleted));
  }, [organizationData, setListData]);

  return listData;
};

const keyExtractor = (item, index) => `index${index}-id${item.id}`;

export const OParlOrganizationsScreen = ({ navigation }: Props) => {
  const [fetchingMore, setFetchingMore] = useState(false);
  const [finished, setFinished] = useState(false);
  const { data, loading, error, fetchMore } = useOParlQuery<{
    [queryName]: OrganizationPreviewData[];
  }>(query, { variables: { pageSize } });

  const listData = useListData(data);

  const onEndReached = async () => {
    if (fetchingMore) return;

    setFetchingMore(true);

    await fetchMore({
      variables: { pageSize, offset: data?.[queryName]?.length },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult?.[queryName].length) {
          setFinished(true);
          return prev;
        }

        // Deduplicate persons by id
        const uniqueOrganizations = [...prev[queryName], ...fetchMoreResult[queryName]].filter(
          (item, index, self) => self.findIndex((o) => o.id === item.id) === index
        );

        return {
          ...prev,
          [queryName]: uniqueOrganizations
        };
      }
    });

    setFetchingMore(false);
  };

  if (loading) {
    return <LoadingSpinner loading />;
  }

  if (error) {
    return (
      <SafeAreaViewFlex>
        <Wrapper>
          <RegularText center>{texts.errors.unexpected}</RegularText>
        </Wrapper>
      </SafeAreaViewFlex>
    );
  }

  return (
    <SafeAreaViewFlex>
      <FlatList
        data={listData}
        initialNumToRender={pageSize}
        keyExtractor={keyExtractor}
        renderItem={({ item }) => <OParlPreviewComponent data={item} navigation={navigation} />}
        onEndReachedThreshold={1.5}
        onEndReached={onEndReached}
        // this does currently not work as intended, until we upgrade our apollo client dependency
        // as of now the fetchmore function does not set the loading state to true
        ListFooterComponent={<LoadingSpinner loading={!finished && fetchingMore} />}
      />
    </SafeAreaViewFlex>
  );
};
