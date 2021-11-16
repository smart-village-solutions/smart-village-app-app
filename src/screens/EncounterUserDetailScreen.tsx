import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView } from 'react-native';

import {
  BoldText,
  EncounterUserDetails,
  LoadingSpinner,
  RegularText,
  Wrapper,
  WrapperWithOrientation
} from '../components';
import { texts } from '../config';
import { useCreateEncounter } from '../hooks';
import { User } from '../types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const EncounterUserDetailScreen = ({ route }: any) => {
  const [data, setData] = useState<User | undefined>(route.params?.data);
  const [error, setError] = useState(false);

  const onError = useCallback(() => setError(true), []);

  const { loading: loadingCreateEncounter, createEncounter } = useCreateEncounter(setData, onError);
  const qrId = route.params?.qrId;

  useEffect(() => {
    if (qrId) {
      setError(false);
      createEncounter(qrId);
    }
  }, [qrId]);

  if (data) {
    return (
      <ScrollView>
        <WrapperWithOrientation>
          <Wrapper>
            <BoldText center>{texts.encounter.newEncounterSuccess}</BoldText>
          </Wrapper>
          {!!data && <EncounterUserDetails data={data} />}
        </WrapperWithOrientation>
      </ScrollView>
    );
  }

  if (!qrId || error) {
    return (
      <ScrollView>
        <WrapperWithOrientation>
          <Wrapper>
            <RegularText>{texts.encounter.errorScanBody}</RegularText>
          </Wrapper>
        </WrapperWithOrientation>
      </ScrollView>
    );
  }

  if (loadingCreateEncounter) {
    return <LoadingSpinner loading />;
  }

  // this should only be rendered initially when freshly navigating to the page, using deeplinking
  // otherwise there should always be data, the request should be loading, or an error occurred
  return null;
};
