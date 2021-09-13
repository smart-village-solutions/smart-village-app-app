import React from 'react';

import { texts } from '../../config';
import { momentFormat } from '../../helpers';
import { useEncounterList } from '../../hooks';
import { Encounter } from '../../types';
import { LoadingSpinner } from '../LoadingSpinner';
import { SectionHeader } from '../SectionHeader';
import { RegularText } from '../Text';
import { Wrapper, WrapperRow, WrapperWithOrientation } from '../Wrapper';

const EncounterEntry = ({ encounter }: { encounter: Encounter }) => {
  return (
    <WrapperRow spaceBetween>
      <Wrapper>
        <RegularText>{momentFormat(encounter.createdAt)}</RegularText>
      </Wrapper>
      <Wrapper>
        <RegularText>{momentFormat(encounter.createdAt, 'HH:mm')}</RegularText>
      </Wrapper>
      <Wrapper>
        <RegularText>{`${texts.encounter.id}: ${encounter.encounterId}`}</RegularText>
      </Wrapper>
    </WrapperRow>
  );
};

export const EncounterList = () => {
  const { loading, data } = useEncounterList();

  return (
    <>
      <SectionHeader title={texts.encounter.history} />
      {!loading && !data.length && (
        <WrapperWithOrientation>
          <Wrapper>
            <RegularText>{texts.encounter.noHistoryYet}</RegularText>
          </Wrapper>
        </WrapperWithOrientation>
      )}
      {data.map((encounter) => (
        <EncounterEntry key={encounter.encounterId} encounter={encounter} />
      ))}
      <LoadingSpinner loading={loading} />
    </>
  );
};
