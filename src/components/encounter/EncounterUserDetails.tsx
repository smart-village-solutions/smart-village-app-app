import React from 'react';
import { View } from 'react-native';
import { Divider } from 'react-native-elements';

import { normalize, texts } from '../../config';
import { momentFormat } from '../../helpers';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import { User } from '../../types';
import { BoldText, RegularText } from '../Text';
import { Wrapper, WrapperRow } from '../Wrapper';

import { ImageWithBadge } from './ImageWithBadge';

type Props = {
  data: User;
};

const EncounterDetailEntry = ({ left, right }: { left: string; right: string }) => {
  const styles = useThemeStyles(createStyles);

  return (
    <Wrapper>
      <WrapperRow spaceBetween style={styles.entryContainer}>
        <RegularText placeholder small textAlign="bottom">
          {left}
        </RegularText>
        <RegularText>{right}</RegularText>
      </WrapperRow>
      <Divider style={styles.divider} />
    </Wrapper>
  );
};

export const EncounterUserDetails = ({ data }: Props) => {
  const styles = useThemeStyles(createStyles);

  return (
    <Wrapper>
      <View style={styles.container}>
        <ImageWithBadge imageUri={data.imageUri} verified={data.verified} />
        <View style={styles.spacer} />
        <BoldText big>{`${data.firstName} ${data.lastName}`.toUpperCase()}</BoldText>
      </View>
      {!data.verified && (
        <>
          <EncounterDetailEntry
            left={texts.encounter.birthDate}
            right={momentFormat(data.birthDate)}
          />
          <EncounterDetailEntry left={texts.encounter.phone} right={data.phone} />
        </>
      )}
      <EncounterDetailEntry
        left={texts.encounter.status}
        right={data.verified ? texts.encounter.verified : texts.encounter.notVerified}
      />
    </Wrapper>
  );
};

const createStyles = (colors) => ({
  container: {
    alignItems: 'center'
  },
  divider: { backgroundColor: colors.placeholder },
  entryContainer: { alignItems: 'flex-end' },
  spacer: {
    height: normalize(14)
  }
});
