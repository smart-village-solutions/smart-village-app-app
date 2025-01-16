import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import { SectionList, StyleSheet } from 'react-native';

import {
  DropdownSelect,
  RegularText,
  SafeAreaViewFlex,
  SectionHeader,
  Wrapper
} from '../../components';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { OParlPreviewComponent } from '../../components/oParl';
import { colors, normalize, texts } from '../../config';
import { useOParlQuery } from '../../hooks';
import { keywordListQuery, keywordQuery } from '../../queries/OParl';
import { OParlObjectData } from '../../types';

type Props = {
  navigation: StackNavigationProp<never>;
};

const UNKNOWN = 'Unbekannt';

const getTitle = (query: string) => {
  switch (query) {
    case 'oParlAgendaItems':
      return texts.oparl.agendaItem.agendaItems;
    case 'oParlConsultations':
      return texts.oparl.consultation.consultations;
    case 'oParlFiles':
      return texts.oparl.file.files;
    case 'oParlLegislativeTerms':
      return texts.oparl.legislativeTerm.legislativeTerms;
    case 'oParlLocations':
      return texts.oparl.location.locations;
    case 'oParlMeetings':
      return texts.oparl.meeting.meetings;
    case 'oParlMemberships':
      return texts.oparl.membership.memberships;
    case 'oParlOrganizations':
      return texts.oparl.organization.organizations;
    case 'oParlPapers':
      return texts.oparl.paper.papers;
    case 'oParlPersons':
      return texts.oparl.person.persons;
    default:
      return UNKNOWN;
  }
};

const mapQueryData = (data: Record<string, OParlObjectData[]>) => {
  return Object.keys(data).map((key) => ({ title: getTitle(key), data: data[key] }));
};

const useKeywordQuery = (dropdownData: { value: string; selected?: boolean }[]) => {
  const variables = { keywords: dropdownData.find((item) => item.selected)?.value };

  const { data, error, loading } = useOParlQuery(keywordQuery, { variables });

  const mappedData = data ? mapQueryData(data) : [];

  return {
    data: mappedData.filter((section) => section.data.length && section.title !== UNKNOWN),
    error,
    loading
  };
};

const keyExtractor = (item, index) => `index${index}-id${item.id}`;

export const OParlSearchScreen = ({ navigation }: Props) => {
  const [dropdownData, setDropdownData] = useState<Array<{ value: string; selected?: boolean }>>(
    []
  );

  const {
    data,
    error: errorKeywordList,
    loading: loadingKeywordList
  } = useOParlQuery<{
    oParlKeywordList: string[];
  }>(keywordListQuery);

  const keywordList = data?.oParlKeywordList;

  useEffect(() => {
    const newData = [{ value: texts.oparl.search.searchTerm, selected: true }];
    newData.push(
      ...(keywordList ?? [])?.map((value) => ({
        value,
        selected: false
      }))
    );
    setDropdownData(newData);
  }, [keywordList, setDropdownData]);

  const {
    data: listData,
    error: errorKeyword,
    loading: loadingKeyword
  } = useKeywordQuery(dropdownData);

  if (!!errorKeyword || !!errorKeywordList)
    return (
      <Wrapper>
        <RegularText center>{texts.errors.unexpected}</RegularText>
      </Wrapper>
    );

  return (
    <SafeAreaViewFlex>
      <SectionList
        sections={listData}
        ListHeaderComponent={
          dropdownData?.length ? (
            <Wrapper>
              <DropdownSelect
                data={dropdownData}
                searchPlaceholder="Suche"
                showSearch
                searchInputStyle={styles.searchInput}
                setData={setDropdownData}
              />
            </Wrapper>
          ) : undefined
        }
        ListFooterComponent={<LoadingSpinner loading={loadingKeywordList || loadingKeyword} />}
        renderSectionHeader={({ section: { title } }) => <SectionHeader title={title} />}
        keyExtractor={keyExtractor}
        renderItem={({ item }) => <OParlPreviewComponent data={item} navigation={navigation} />}
      />
    </SafeAreaViewFlex>
  );
};

const styles = StyleSheet.create({
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
