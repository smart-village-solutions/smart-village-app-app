import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';

import {
  DropdownSelect,
  RegularText,
  SafeAreaViewFlex,
  Wrapper,
  WrapperHorizontal
} from '../../components';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { OParlPreviewComponent } from '../../components/oParl';
import { colors, normalize, texts } from '../../config';
import { useOParlQuery } from '../../hooks';
import {
  simpleOrganizationListQuery,
  organizationMembershipQuery,
  personListQuery
} from '../../queries/OParl';
import {
  OrganizationListData,
  OrganizationPeopleData,
  OrganizationPreviewData,
  PersonPreviewData
} from '../../types';

type Props = {
  navigation: StackNavigationProp<never>;
};

const pageSize = 30;

const [organizationMembersQuery, organizationMembersQueryName] = organizationMembershipQuery;
const [orgaListQuery, orgaListQueryName] = simpleOrganizationListQuery;
const [personQuery, personQueryName] = personListQuery;

const useDropdownData = (orgaData?: { [organizationMembersQueryName]: OrganizationListData[] }) => {
  const [dropdownData, setDropdownData] = useState<
    Array<{ value: string; id: string; selected?: boolean }>
  >([{ value: texts.oparl.personList.chooseAnOrg, id: '', selected: true }]);

  useEffect(() => {
    const organizations =
      orgaData?.[organizationMembersQueryName].filter(
        (org) => org.membership?.filter((mem) => !mem.endDate).length
      ) ?? [];

    const newData = [{ value: texts.oparl.personList.chooseAnOrg, id: '', selected: true }];
    newData.push(
      ...organizations.map((value: OrganizationPreviewData) => ({
        value: value.name ?? value.shortName ?? value.id,
        id: value.id,
        selected: false
      }))
    );
    setDropdownData(newData);
  }, [orgaData, setDropdownData]);

  return [dropdownData, setDropdownData] as const;
};

const useListData = (
  organization?: OrganizationPeopleData,
  personData?: { [personQueryName]: PersonPreviewData[] }
) => {
  const [listData, setListData] = useState<PersonPreviewData[]>([]);

  useEffect(() => {
    const persons = personData?.[personQueryName] ?? [];

    if (organization) {
      setListData(
        organization.membership
          ?.filter((mem) => !mem.endDate)
          ?.map((mem) => mem.person)
          .filter<PersonPreviewData>(
            // we filter out the undefined values here, so the result is an array of PersonPreviews
            (person): person is PersonPreviewData => !!person && !person.deleted
          ) ?? []
      );
    } else {
      setListData((persons ?? []).filter((person: PersonPreviewData) => !person.deleted));
    }
  }, [organization, personData, setListData]);

  return listData;
};

// eslint-disable-next-line complexity
export const OParlPersonsScreen = ({ navigation }: Props) => {
  const [fetchingMore, setFetchingMore] = useState(false);
  const [finished, setFinished] = useState(false);
  const {
    data: orgaListData,
    loading: orgaListLoading,
    error: orgaListError
  } = useOParlQuery<{
    [orgaListQueryName]: OrganizationListData[];
  }>(orgaListQuery);

  const {
    data: personData,
    loading: personLoading,
    error: personError,
    fetchMore: personFetchMore
  } = useOParlQuery<{
    [personQueryName]: PersonPreviewData[];
  }>(personQuery, { variables: { pageSize } });

  const [dropdownData, setDropdownData] = useDropdownData(orgaListData);

  const organizations = orgaListData?.[orgaListQueryName] ?? [];

  const selectedDropdownEntry = dropdownData?.find((entry) => entry.selected)?.id;

  const selectedOrganization = selectedDropdownEntry?.length
    ? organizations?.find(
        (singleOrg: OrganizationPreviewData) => singleOrg.id === selectedDropdownEntry
      )
    : undefined;

  const {
    data: orgaData,
    loading: orgaLoading,
    error: orgaError
  } = useOParlQuery<{
    [organizationMembersQueryName]: OrganizationPeopleData[];
  }>(organizationMembersQuery, {
    variables: { id: selectedOrganization?.id },
    skip: !selectedOrganization?.id
  });

  const listData = useListData(orgaData?.[organizationMembersQueryName][0], personData);

  const onEndReached = async () => {
    if (fetchingMore) return;

    setFetchingMore(true);
    if (!selectedOrganization?.id) {
      await personFetchMore({
        variables: { pageSize, offset: personData?.[personQueryName]?.length },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult?.[personQueryName].length) {
            setFinished(true);
            return prev;
          }
          return Object.assign({}, prev, {
            [personQueryName]: [...prev[personQueryName], ...fetchMoreResult[personQueryName]]
          });
        }
      });
    }
    setFetchingMore(false);
  };

  if (orgaListLoading) {
    return <LoadingSpinner loading />;
  }

  if (!!personError || !!orgaError || !!orgaListError) {
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
        data={!orgaLoading ? listData : undefined}
        renderItem={({ item }) => (
          <WrapperHorizontal key={item.id}>
            <OParlPreviewComponent data={item} navigation={navigation} />
          </WrapperHorizontal>
        )}
        ListHeaderComponent={
          <Wrapper style={styles.noPaddingTop}>
            <DropdownSelect
              data={dropdownData}
              searchPlaceholder="Suche"
              showSearch
              searchInputStyle={styles.searchInput}
              setData={setDropdownData}
            />
          </Wrapper>
        }
        onEndReachedThreshold={1.5}
        onEndReached={onEndReached}
        // this does currently not work as intended, until we upgrade our apollo client dependency
        // as of now the fetchmore function does not set the loading state to true
        ListFooterComponent={
          <LoadingSpinner loading={personLoading || orgaLoading || (!finished && fetchingMore)} />
        }
      />
    </SafeAreaViewFlex>
  );
};

const styles = StyleSheet.create({
  noPaddingTop: { paddingTop: 0 },
  searchInput: {
    borderColor: colors.borderRgba,
    borderWidth: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    color: colors.darkText,
    fontFamily: 'regular',
    fontSize: normalize(16),
    justifyContent: 'space-between',
    lineHeight: normalize(22),
    paddingHorizontal: normalize(14),
    paddingVertical: normalize(12)
  }
});
