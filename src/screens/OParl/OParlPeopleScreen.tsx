import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { NavigationScreenProp } from 'react-navigation';

import {
  DropdownSelect,
  HeaderLeft,
  RegularText,
  SafeAreaViewFlex,
  Wrapper
} from '../../components';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { OParlPreviewComponent } from '../../components/oParl';
import { colors, normalize, texts } from '../../config';
import { useOParlQuery } from '../../hooks';
import { organizationListQuery, personListQuery } from '../../queries/OParl';
import { OrganizationPeopleData, OrganizationPreviewData, PersonPreviewData } from '../../types';

type Props = {
  navigation: NavigationScreenProp<never>;
};

const [orgaQuery, orgaQueryName] = organizationListQuery;
const [personQuery, personQueryName] = personListQuery;

const useDropdownData = (orgaData?: { [orgaQueryName]: OrganizationPeopleData[] }) => {
  const [dropdownData, setDropdownData] = useState<
    Array<{ value: string; id: string; selected?: boolean }>
  >([{ value: texts.oparl.people.chooseAnOrg, id: '', selected: true }]);

  useEffect(() => {
    const organizations = orgaData?.[orgaQueryName] ?? [];
    const newData = [{ value: texts.oparl.people.chooseAnOrg, id: '', selected: true }];
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
  dropdownData?: Array<{ value: string; id: string; selected?: boolean }>,
  orgaData?: { [orgaQueryName]: OrganizationPeopleData[] },
  personData?: { [personQueryName]: PersonPreviewData[] }
) => {
  const [listData, setListData] = useState<PersonPreviewData[]>([]);

  useEffect(() => {
    const organizations = orgaData?.[orgaQueryName] ?? [];
    const persons = personData?.[personQueryName] ?? [];

    const selectedDropdownEntry = dropdownData?.find((entry) => entry.selected)?.id;

    const org = selectedDropdownEntry?.length
      ? organizations?.find(
          (singleOrg: OrganizationPreviewData) => singleOrg.id === selectedDropdownEntry
        )
      : undefined;

    if (org) {
      setListData(
        org.membership
          ?.map((membership) => membership.person)
          .filter<PersonPreviewData>(
            // we filter out the undefined values here, so the result is an array of PersonPreviews
            (person): person is PersonPreviewData => !!person && !person.deleted
          ) ?? []
      );
    } else {
      setListData((persons ?? []).filter((person: PersonPreviewData) => !person.deleted));
    }
  }, [dropdownData, setListData]);

  return listData;
};

export const OParlPeopleScreen = ({ navigation }: Props) => {
  const { data: orgaData, loading: orgaLoading, error: orgaError } = useOParlQuery<{
    [orgaQueryName]: OrganizationPeopleData[];
  }>(orgaQuery);

  const { data: personData, loading: personLoading, error: personError } = useOParlQuery<{
    [personQueryName]: PersonPreviewData[];
  }>(personQuery);

  const [dropdownData, setDropdownData] = useDropdownData(orgaData);
  const listData = useListData(dropdownData, orgaData, personData);

  return (
    <SafeAreaViewFlex>
      <ScrollView>
        <Wrapper>
          <DropdownSelect
            data={dropdownData}
            searchPlaceholder="Suche"
            showSearch
            searchInputStyle={styles.searchInput}
            setData={setDropdownData}
          />
        </Wrapper>
        <LoadingSpinner loading={orgaLoading || personLoading} />
        {(!!personError || !!orgaError) && (
          <RegularText center>{texts.errors.unexpected}</RegularText>
        )}
        {listData.map((item) => (
          <OParlPreviewComponent data={item} key={item.id} navigation={navigation} />
        ))}
      </ScrollView>
    </SafeAreaViewFlex>
  );
};

OParlPeopleScreen.navigationOptions = ({ navigation }: Props) => {
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
