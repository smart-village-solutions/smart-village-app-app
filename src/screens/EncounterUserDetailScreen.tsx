import React from 'react';
import { ScrollView } from 'react-native';

import { EncounterUserDetails, SectionHeader, WrapperWithOrientation } from '../components';
import { texts } from '../config';

// TODO: accesibility labels
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const EncounterUserDetailScreen = ({ route }: any) => {
  return (
    <ScrollView>
      {/* TODO: soll hier tatsächlich gender logic hin? */}
      <WrapperWithOrientation>
        <SectionHeader title={texts.encounter.detailTitle} />
        {route.params?.data && <EncounterUserDetails data={route.params.data} />}
      </WrapperWithOrientation>
    </ScrollView>
  );
};
