import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, NavigationScreenProp } from 'react-navigation';

import { HeaderLeft, RegularText, SafeAreaViewFlex, Wrapper } from '../../components';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { OParlPreviewComponent } from '../../components/oParl';
import { texts } from '../../config';
import { useOParlQuery } from '../../hooks';
import { organizationListQuery } from '../../queries/OParl';
import { OrganizationPreviewData } from '../../types';

type Props = {
  navigation: NavigationScreenProp<never>;
};

const pageSize = 20;

const [query, queryName] = organizationListQuery;

const useListData = (organizationData?: { [queryName]: OrganizationPreviewData[] }) => {
  const [listData, setListData] = useState<OrganizationPreviewData[]>([]);

  useEffect(() => {
    const organizations = organizationData?.[queryName] ?? [];
    setListData(organizations.filter((orga: OrganizationPreviewData) => !orga.deleted));
  }, [organizationData, setListData]);

  return listData;
};

export const OParlOrganizationsScreen = ({ navigation }: Props) => {
  const { data, loading, error, fetchMore } = useOParlQuery<{
    [queryName]: OrganizationPreviewData[];
  }>(query, { variables: { pageSize } });

  const listData = useListData(data);

  const onEndReached = useCallback(() => {
    fetchMore({
      variables: { pageSize, offset: data?.[queryName]?.length },
      updateQuery: (previousResult, { fetchMoreResult }) => {
        const resultArray: OrganizationPreviewData[] = [];

        if (!fetchMoreResult?.[queryName].length) return previousResult;

        if (previousResult[queryName].length) {
          resultArray.push(...previousResult[queryName]);
        }

        if (fetchMoreResult?.[queryName].length) {
          resultArray.push(...fetchMoreResult[queryName]);
        }

        return { [queryName]: resultArray };
      }
    });
  }, [data, fetchMore]);

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
        renderItem={({ item }) => (
          <OParlPreviewComponent data={item} key={item.id} navigation={navigation} />
        )}
        onEndReachedThreshold={0.5}
        onEndReached={onEndReached}
        // this does currently not work as intended, until we upgrade our apollo client dependency
        // as of now the fetchmore function does not set the loading state to true
        ListFooterComponent={<LoadingSpinner loading={loading} />}
      />
    </SafeAreaViewFlex>
  );
};

OParlOrganizationsScreen.navigationOptions = ({ navigation }: Props) => {
  return {
    headerLeft: <HeaderLeft navigation={navigation} />
  };
};
