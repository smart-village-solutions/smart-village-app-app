import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { NavigationScreenProp } from 'react-navigation';

import { DropdownSelect, HeaderLeft, SafeAreaViewFlex, Wrapper } from '../../components';
import { OParlPreviewComponent } from '../../components/oParl';
import { colors, normalize, texts } from '../../config';
import { executeOParlQuery } from '../../OParlProvider';
import { organizationListQuery, personListQuery } from '../../queries/OParl';
import {
  MembershipPreviewData,
  OParlObjectData,
  OrganizationPreviewData,
  PersonPreviewData
} from '../../types';

type Props = {
  navigation: NavigationScreenProp<never>;
};

// type HeaderProps = {
//   selected: number;
//   setSelected: React.Dispatch<React.SetStateAction<number>>;
//   labels: string[];
// };

// const renderSwitchHeaderItem = (
//   label: string,
//   index: number,
//   selected: number,
//   setSelected: React.Dispatch<React.SetStateAction<number>>
// ) => {
//   const onPress = useCallback(() => setSelected(index), [setSelected, index]);
//   return (
//     <Touchable onPress={onPress} key={label}>
//       <WrapperHorizontal big>
//         <ListSwitchItem>
//           <BoldText small>{label}</BoldText>
//           {index === selected && <ListSwitchItemBorder />}
//         </ListSwitchItem>
//       </WrapperHorizontal>
//     </Touchable>
//   );
// };

// const SwitchHeader = ({ setSelected, selected, labels }: HeaderProps) => {
//   return (
//     <ListSwitchWrapper>
//       {labels.map((label, index) => renderSwitchHeaderItem(label, index, selected, setSelected))}
//     </ListSwitchWrapper>
//   );
// };

// const labels = ['Organisationen', 'Personen'];

export const OParlPeopleScreen = ({ navigation }: Props) => {
  // const [selected, setSelected] = useState(0);
  const [dropdownData, setDropdownData] = useState<
    Array<{ value: string; id: string; selected?: boolean }>
  >([]);
  const [listData, setListData] = useState<OParlObjectData[]>([]);

  const [persons, setPersons] = useState<any>();
  const [organizations, setOrganizations] = useState<any>();

  useEffect(() => {
    executeOParlQuery(organizationListQuery, setOrganizations);
  }, [setOrganizations]);

  useEffect(() => {
    executeOParlQuery(personListQuery, setPersons);
  }, [setPersons]);

  useEffect(() => {
    const selectedDropdownEntry = dropdownData.find((entry) => entry.selected)?.id;
    const org =
      selectedDropdownEntry?.length &&
      organizations?.find(
        (singleOrg: OrganizationPreviewData) => singleOrg.id === selectedDropdownEntry
      );

    if (org) {
      setListData(
        org.membership
          ?.map((membership: MembershipPreviewData) => membership.person)
          .filter((person: PersonPreviewData | undefined) => !!person && !person.deleted) ?? []
      );
    } else {
      setListData((persons ?? []).filter((person: PersonPreviewData) => !person.deleted));
    }
  }, [dropdownData, organizations, persons, setListData]);

  useEffect(() => {
    const newData = [{ value: texts.oparl.people.chooseAnOrg, id: '', selected: true }];
    newData.push(
      ...(organizations ?? [])?.map((value: OrganizationPreviewData) => ({
        value: value.name ?? value.shortName ?? value.id,
        id: value.id,
        selected: false
      }))
    );
    setDropdownData(newData);
  }, [organizations, setDropdownData]);

  return (
    <SafeAreaViewFlex>
      {/* <SwitchHeader labels={labels} selected={selected} setSelected={setSelected} /> */}
      <ScrollView>
        {!!dropdownData?.length && (
          <Wrapper>
            <DropdownSelect
              data={dropdownData}
              searchPlaceholder="Suche"
              showSearch
              searchInputStyle={styles.searchInput}
              setData={setDropdownData}
            />
          </Wrapper>
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
