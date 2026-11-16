import React from 'react';

import { texts } from '../../config';
import { Button } from '../Button';
import { RegularText } from '../Text';
import { Wrapper } from '../Wrapper';

export const VolunteerStorageError = ({ onRetry }: { onRetry: () => void }) => (
  <Wrapper>
    <RegularText>{texts.volunteer.errorLoadingStoredData}</RegularText>
    <Button title={texts.volunteer.retry} onPress={onRetry} />
  </Wrapper>
);
