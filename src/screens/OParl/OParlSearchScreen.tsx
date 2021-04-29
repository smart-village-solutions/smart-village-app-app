import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { NavigationScreenProp, SectionList } from 'react-navigation';

import {
  DropdownSelect,
  HeaderLeft,
  SafeAreaViewFlex,
  SectionHeader,
  Wrapper
} from '../../components';
import { OParlPreviewComponent } from '../../components/oParl';
import { colors, normalize, texts } from '../../config';
import { OParlClient } from '../../OParlProvider';
import { keywordListQuery, keywordQuery } from '../../queries/OParl';
import { OParlObjectData } from '../../types';

type Props = {
  navigation: NavigationScreenProp<never>;
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
  const [sectionListData, setSectionListData] = useState<
    {
      title: string;
      data: OParlObjectData[];
    }[]
  >([]);

  const executeKeywordQuery = async (dropdownData: { value: string; selected?: boolean }[]) => {
    const variables = { keywords: dropdownData.find((item) => item.selected)?.value };

    if (!variables.keywords) return;

    try {
      const { data, errors } = await OParlClient.query({
        query: keywordQuery,
        variables
      });
      if (!errors) setSectionListData(mapQueryData(data));
    } catch (e) {
      console.warn('caught:', e);
    }
  };

  useEffect(() => {
    executeKeywordQuery(dropdownData);
  }, [dropdownData]);

  return sectionListData.filter((section) => section.data.length && section.title !== UNKNOWN);
};

const useKeywordList = () => {
  const [keywords, setKeywords] = useState<string[]>([]);

  const executeKeywordListQuery = async () => {
    try {
      const { data, errors } = await OParlClient.query({
        query: keywordListQuery
      });
      if (!errors) setKeywords(data.oParlKeywordList);
    } catch (e) {
      console.warn('caught:', e);
    }
  };

  useEffect(() => {
    executeKeywordListQuery();
  }, []);

  return keywords;
};

export const OParlSearchScreen = ({ navigation }: Props) => {
  const [dropdownData, setDropdownData] = useState<Array<{ value: string; selected?: boolean }>>(
    []
  );

  const keywordList = useKeywordList();

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

  const listData = useKeywordQuery(dropdownData);

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
        renderSectionHeader={({ section: { title } }) => <SectionHeader title={title} />}
        renderItem={({ item }) => (
          <OParlPreviewComponent data={item} key={item.id} navigation={navigation} />
        )}
      />
    </SafeAreaViewFlex>
  );
};

OParlSearchScreen.navigationOptions = ({ navigation }: Props) => {
  return {
    headerLeft: <HeaderLeft navigation={navigation} />
  };
};

const styles = StyleSheet.create({
  searchInput: {
    borderColor: colors.borderRgba,
    borderWidth: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    color: colors.darkText,
    fontFamily: 'titillium-web-regular',
    fontSize: normalize(16),
    justifyContent: 'space-between',
    lineHeight: normalize(22),
    paddingHorizontal: normalize(14),
    paddingVertical: normalize(12)
  }
});
