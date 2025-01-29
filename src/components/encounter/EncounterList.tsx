import React from 'react';
import { StyleSheet } from 'react-native';
import { Divider } from 'react-native-elements';

import { colors, texts } from '../../config';
import { momentFormat } from '../../helpers';
import { useEncounterList } from '../../hooks';
import { Encounter } from '../../types';
import { LoadingSpinner } from '../LoadingSpinner';
import { SectionHeader } from '../SectionHeader';
import { RegularText } from '../Text';
import { Wrapper, WrapperRow } from '../Wrapper';

const EncounterEntry = ({ encounter }: { encounter: Encounter }) => {
  return (
    <>
      <WrapperRow>
        <Wrapper>
          <RegularText>{momentFormat(encounter.createdAt)}</RegularText>
        </Wrapper>
        <Wrapper>
          <RegularText>{momentFormat(encounter.createdAt, 'HH:mm')}</RegularText>
        </Wrapper>
      </WrapperRow>
      <Wrapper shrink noPaddingTop>
        <RegularText>{`${texts.encounter.encounterId}:`}</RegularText>
        <RegularText small selectable>{`${encounter.encounterId}`}</RegularText>
      </Wrapper>
      <Divider style={styles.divider} />
    </>
  );
};

export const EncounterList = () => {
  const { loading, data } = useEncounterList();

  return (
    <>
      <SectionHeader title={texts.encounter.history} />
      {!loading && !data?.length && (
        <Wrapper>
          <RegularText>{texts.encounter.noHistoryYet}</RegularText>
        </Wrapper>
      )}
      {data?.map((encounter) => (
        <EncounterEntry key={encounter.encounterId} encounter={encounter} />
      ))}
      <LoadingSpinner loading={loading} />
    </>
  );
};

const styles = StyleSheet.create({
  divider: {
    backgroundColor: colors.placeholder
  }
});
