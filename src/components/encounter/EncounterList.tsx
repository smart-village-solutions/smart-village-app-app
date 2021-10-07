import React from 'react';
import { StyleSheet, View } from 'react-native';

import { texts } from '../../config';
import { momentFormat } from '../../helpers';
import { useEncounterList } from '../../hooks';
import { Encounter } from '../../types';
import { LoadingSpinner } from '../LoadingSpinner';
import { SectionHeader } from '../SectionHeader';
import { RegularText } from '../Text';
import { Wrapper, WrapperWithOrientation } from '../Wrapper';

const EncounterEntry = ({ encounter }: { encounter: Encounter }) => {
  return (
    <View style={styles.entryContainer}>
      <Wrapper>
        <RegularText>{momentFormat(encounter.createdAt)}</RegularText>
      </Wrapper>
      <Wrapper>
        <RegularText>{momentFormat(encounter.createdAt, 'HH:mm')}</RegularText>
      </Wrapper>
      <Wrapper shrink>
        <RegularText selectable>{`${texts.encounter.id}: ${encounter.encounterId}`}</RegularText>
      </Wrapper>
    </View>
  );
};

export const EncounterList = () => {
  const { loading, data } = useEncounterList();

  return (
    <WrapperWithOrientation>
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
    </WrapperWithOrientation>
  );
};

const styles = StyleSheet.create({
  entryContainer: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row'
  }
});
